import errno
import socket
from flask import Flask, jsonify
from flask_cors import CORS
from flask_autoindex import AutoIndex
from pydub import AudioSegment
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import os
import time
import threading
import exportconfig

INPUT_DIRECTORY = 'audio_input'
OUTPUT_DIRECTORY = 'audio_output'
PORT = 8080
SILENCE_THRESHOLD = -50.0
CERT_FILE = 'cert.pem'
KEY_FILE = 'key.pem'


def get_serving_url() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.254.254.254', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()

    if os.path.exists(CERT_FILE) and os.path.exists(KEY_FILE):
        return f'https://{ip}:{PORT}'
    else:
        return f'http://{ip}:{PORT}'


serving_url = get_serving_url()
exporttools = exportconfig.ExportConfigTools(
    INPUT_DIRECTORY, OUTPUT_DIRECTORY, serving_url
)

if not os.path.exists(INPUT_DIRECTORY):
    os.makedirs(INPUT_DIRECTORY)
if not os.path.exists(OUTPUT_DIRECTORY):
    os.makedirs(OUTPUT_DIRECTORY)

app = Flask(__name__)
CORS(app)
AutoIndex(app, browse_root=OUTPUT_DIRECTORY)

processed_files: dict[str, float] = {}


def detect_leading_silence(
    sound, silence_threshold=SILENCE_THRESHOLD, chunk_size=10
) -> int:
    trim_start = 0
    while trim_start < len(sound):
        chunk = sound[trim_start : trim_start + chunk_size]
        if chunk.dBFS > silence_threshold:
            return trim_start
        trim_start += chunk_size
    return trim_start


def get_file_path(file_path: str, dest: str) -> str:
    if dest == 'input':
        relative_path = os.path.relpath(file_path, OUTPUT_DIRECTORY)
        dest_file_path = os.path.join(INPUT_DIRECTORY, relative_path)
    elif dest == 'output':
        relative_path = os.path.relpath(file_path, INPUT_DIRECTORY)
        dest_file_path = os.path.join(OUTPUT_DIRECTORY, relative_path)
    else:
        raise ValueError('Invalid destination')

    dest_dir = os.path.dirname(dest_file_path)
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
    return dest_file_path


def add_audio(file_path) -> None:
    if not file_path.endswith('.mp3'):
        return

    try:
        audio = AudioSegment.from_file(file_path, format='mp3')

        # remove file in output directory if it exists
        output_file_path = get_file_path(file_path, 'output')
        if os.path.exists(output_file_path):
            os.remove(output_file_path)

        # Remove leading silence
        start_trim = detect_leading_silence(audio)
        trimmed_audio = audio[start_trim:]

        # Normalize volume
        max_db = trimmed_audio.max_dBFS
        normalized_audio = trimmed_audio.apply_gain(-max_db)

        # Save to output directory
        if not os.path.exists(output_file_path):
            normalized_audio.export(output_file_path, format='mp3', bitrate='192k')
            print(
                f'🔊 Processed: {output_file_path} ({start_trim} milisec silence removed + normalized)'
            )

        if start_trim >= len(audio):
            print(f'⚠️ The entire audio is detected silent: {file_path}')
            remove_audio(output_file_path)
    except OSError:
        pass
    except Exception as e:
        print(f'⚠️ Error processing {file_path}: {e}')


def remove_audio(file_path) -> None:
    if not file_path.endswith('.mp3'):
        return

    try:
        output_file_path = get_file_path(file_path, 'output')
        if os.path.exists(output_file_path):
            os.remove(output_file_path)
            print(f'🗑️ Removed: {os.path.basename(file_path)}')
    except OSError as e:
        if e.errno != errno.ENOENT:
            raise


def process_audio_files() -> None:
    print('🛠️ Preprocessing audio files...')
    for root, _, files in os.walk(INPUT_DIRECTORY):
        for file in files:
            input_file_path = os.path.join(root, file)
            output_file_path = get_file_path(input_file_path, 'output')
            if not os.path.exists(output_file_path):
                add_audio(input_file_path)

    # remove all files which are not in the input directory
    for root, _, files in os.walk(OUTPUT_DIRECTORY):
        for file in files:
            input_file_path = get_file_path(os.path.join(root, file), 'input')
            if not os.path.exists(input_file_path):
                remove_audio(os.path.join(root, file))


class AudioFileHandler(FileSystemEventHandler):
    def on_created(self, event) -> None:
        print(f'🆕 Trigger Create: {event.src_path}')
        time.sleep(1)  # Wait for file to be written
        if not event.is_directory:
            add_audio(event.src_path)

    def on_moved(self, event) -> None:
        print(f'🔄 Trigger Move: {event.src_path} -> {event.dest_path}')
        time.sleep(1)  # Wait for file to be written
        if not event.is_directory:
            remove_audio(event.src_path)
            add_audio(event.dest_path)

    def on_deleted(self, event) -> None:
        print(f'🗑️ Trigger Delete: {event.src_path}')
        if not event.is_directory:
            remove_audio(event.src_path)


def start_watchdog() -> None:
    observer = Observer()
    event_handler = AudioFileHandler()
    observer.schedule(event_handler, INPUT_DIRECTORY, recursive=True)
    observer.start()
    print('👀 Watching for file changes in:', INPUT_DIRECTORY)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()


exporttools.generate_export_config_folder_structure()
process_audio_files()

watchdog_thread = threading.Thread(target=start_watchdog, daemon=True)
watchdog_thread.start()


@app.route('/export_json', methods=['GET'])
def export_json() -> str:
    export_json = exporttools.build_export_json()
    return jsonify(export_json)


if __name__ == '__main__':
    if os.path.exists(CERT_FILE) and os.path.exists(KEY_FILE):
        print(f'🚀 Serving MP3 files on {serving_url}')
        app.run(host='0.0.0.0', port=PORT, ssl_context=(CERT_FILE, KEY_FILE))
    else:
        print(f'🚀 Serving MP3 files on {serving_url}')
        app.run(host='0.0.0.0', port=PORT)
