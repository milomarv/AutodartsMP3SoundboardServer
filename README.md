# Local MP3 Server for AutoDarts Soundboard 🎯

## Important Notes ❗
- **Security** 🔒 Only use this script on a secure local network to prevent unauthorized access to your MP3 files.
- **Not completly tested** 🧪 This script is still in development and may have bugs or issues.
- **Hobby Project** 🎨 This Project was quickly programed and is not optimized for performance or scalability.
- **No Support** 🚫 This script is provided as-is without any guarantees or support. Use at your own risk.  

## Introduction 💡

This project provides a local MP3 server for use with the [Tools for AutoDarts Chrome Extension](https://chromewebstore.google.com/detail/tools-for-autodarts/oolfddhehmbpdnlmoljmllcdggmkgihh). The extension allows users to set custom sounds for specific events in AutoDarts by either uploading MP3 files or providing direct URLs to them.&#x20;

### The Problems 🚫

1. **Limited File Uploads** 📂 – Uploading MP3 files directly is restricted in size and number.
2. **Unclear File Links** 🔗 – Using URLs often results in cryptic links that don't indicate the content of the MP3 file.
3. **Inconsistent Volume Levels** 🔊 – Some online MP3 files are too loud, while others are too quiet.
4. **Silence at the Beginning** 🔕 – Many MP3s have unwanted silence at the start, causing delayed playback (e.g., hearing a sound 3 seconds after hitting a triple 20).

### The Solution ✅

To address these issues, this Python script was developed using Flask, Watchdog, and Pydub. It provides:

1. **A Local MP3 Server** 🖥️ – Host MP3 files on a local device (PC, Raspberry Pi, etc.) to serve them via a structured URL.
2. **Unlimited Storage** 💾 – Store as many MP3s as the device allows without any upload limitations.
3. **Clear URL Structure** 🌐 – Example: `http://localhost:8080/triple/cheer.mp3`, making it easy to identify sounds.
4. **AutoIndex UI** 📜 – Browse MP3 files via a simple web interface.
5. **Independent Input & Output Folders** 📁 – Place MP3s into `audio_input`, and they will be processed into `audio_output`.
6. **Volume Normalization** 🎚️ – Ensures all MP3s play at a consistent volume.
7. **Automatic Silence Trimming** ✂️ – Removes leading silence so sounds play instantly.

---

## Installation 📥

### Get the Repository 📦

1. **Install Git** 🐙

   Download and install Git from [git-scm.com](https://git-scm.com/downloads).

1. **Clone the Repository** 📂

   Use Git to clone the repository to your local device:
    ```sh
    git clone https://github.com/milomarv/AutodartsMP3SoundboardServer.git
    ```

1. **Navigate to the Directory** 📁

   Move into the project folder:
    ```sh
    cd AutodartsMP3SoundboardServer
    ```

### Windows Installation 🖥️

1. **Install Python** 🐍

   - Download and install Python from [python.org](https://www.python.org/downloads/).
   - Ensure `pip` is installed and added to the system PATH.

2. **Set Up a Virtual Environment** 🛠️
    
    Build a virtual environment to keep dependencies isolated.

    ❗ **ONLY THE FIRST TIME** ❗
    ```sh
    python -m venv venv
    ```

    Activate the virtual environment.

    ▶️ **Every Time You start the script** ▶️
    ```sh
    .\venv\Scripts\activate
    ```

3. **Install Required Packages** 📦

    ❗ **ONLY THE FIRST TIME** ❗
   ```sh
   pip install -r requirements.txt
   ```

4. **Run the Script** 🚀

   ```sh
   python audio_mp3_server.py
   ```

### Linux / Raspberry Pi Installation 🐧

1. **Install Dependencies** 🔧

   ```sh
   sudo apt update && sudo apt install python3 python3-pip ffmpeg -y
   ```

2. **Set Up a Virtual Environment** 🛠️

    Build a virtual environment to keep dependencies isolated.

    ❗ **ONLY THE FIRST TIME** ❗
    ```sh
    python3 -m venv venv
    ```

    Activate the virtual environment.

    ▶️ **Every Time You start the script** ▶️
    ```sh
    source venv/bin/activate
    ```

2. **Install Required Python Packages** 🐍

    ❗ **ONLY THE FIRST TIME** ❗
   ```sh
   pip3 install -r requirements.txt
   ```

3. **Run the Script** 🚀

   ```sh
   python3 audio_mp3_server.py
   ```

---

## Accessing the MP3 Server UI 🔗

Once the script is running, open a browser and go to:

```
http://<your-ip>:8080/
```

Just use the `localhost` if you are running the script on the same device you are accessing the browser.

To get your IP address in the local network:

- **Windows:** 🖥️ Run `ipconfig` in Command Prompt and find `IPv4 Address`.
- **Linux / Raspberry Pi:** 🐧 Run `hostname -I` in the terminal.

Copy the URL for any MP3 file and paste it into the AutoDarts extension to set it as a custom sound.

---

## How the Code Works 🔍

### Constants 🔢

At the beginning of the script, these constants define key configurations:

```python
INPUT_DIRECTORY = 'audio_input'  # Folder for unprocessed MP3s
OUTPUT_DIRECTORY = 'audio_output'  # Folder for processed MP3s
PORT = 8080  # The server port
SILENCE_THRESHOLD = -50.0  # dB level for silence detection
```

You can adjust these values if needed, for example:

- **Change the server port** 🔄 if `8080` is already in use.
- **Modify the silence threshold** 🎚️ if silence trimming is too aggressive or not aggressive enough.

### Main Components 🔧

- **Flask Server** 🌐 – Hosts MP3 files with AutoIndex UI.
- **Watchdog** 👀 – Detects new MP3 files in `audio_input` and automatically processes them.
- **Pydub Processing** 🎛️ – Trims silence, normalizes volume, and moves the MP3 to `audio_output`.

### Running the Server 🚀

Activate the virtual environment:
```sh
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux / Raspberry Pi
``` 

Then execute:

```sh
python audio_mp3_server.py
```

Once running, the server will:

1. **Scan** `audio_input`  process any MP3 files.
2. **Normalize their volume** 🎚️ – Ensure consistent audio levels.
3. **Save them in** `audio_output`  so can be acessed via the browser.
4. **Watch for new or removed files** 👀 – Update accordingly.

---

## Conclusion 🎯

This script provides a powerful and flexible way to manage MP3 sounds for AutoDarts, solving the limitations of file uploads and cryptic URLs. By hosting files locally, you get unlimited storage, better organization, and consistent audio quality. 🚀

For any issues or improvements, feel free to contribute or modify the script as needed! ✨


