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

### Download the Repository 📦

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

### Update the Repository 🔄
- **Pull the Latest Changes** ⬇️

    If you have already cloned the repository, you can update it with the latest changes:
    ```sh
    git pull
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


### Adding first MP3 files 🎵
1. **Initialize Script** 🚀
    In order to make the `audio_input` folder visible in your file explorer, you need to start the script first.
    ```sh
   python3 audio_mp3_server.py
   ```
   Stop the script with `CTRL + C` after the server is running.

2. **Add MP3 files** 🎵
    Place your MP3 files in the `audio_input` folder. The script will automatically process them and move them to the `audio_output` folder on next startup.

---

## Accessing the MP3 Server UI 🔗

Once the script is running, open a browser and go to:

```
http://localhost:8080/
```

## Enable HTTPS for different devices in the same network 🌐

❗**Problem:** If you want to access the server from a different device in the same network, you need to replace `localhost` with the IP address of the server. However, this can cause issues with the browser blocking the connection due to security concerns.

### Get your IP address in the local network 🌐

   - **Windows:** 🖥️ Run `ipconfig` in Command Prompt and find `IPv4 Address`.
   - **Linux / Raspberry Pi:** 🐧 Run `hostname -I` in the terminal.

### Install OpenSSL 🛠️

   - **Windows:** 🖥️ Download and install [OpenSSL](https://slproweb.com/products/Win32OpenSSL.html).
   - **Linux / Raspberry Pi:** 🐧 Run `sudo apt install openssl`.
   
   Ensure `openssl` is added to the system PATH:
   ```sh	
   openssl version
   ```

### Generate a Self-Signed Certificate 🛡️

   Run the following command to generate a self-signed certificate:
   ```sh
   openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out cert.pem
   ```

   There will be a series of prompts to fill in. You can skip most of them by pressing `Enter`.

   This will create `key.pem` and `cert.pem` files.

### Start the Server with HTTPS 🚀

   If `key.pem` and `cert.pem` are in the project directory, the script will automatically use HTTPS.
   
   ```sh
   python audio_mp3_server.py
   ```

### Access the Server 🌐

   Open a browser on the other device and go to:
   ```
   https://<IP_ADDRESS>:8080/
   ```

   Replace `<IP_ADDRESS>` with the IP address of the server.

   You may need to accept the security warning in the browser to proceed. Just click on `Advanced` and `Proceed`.


---

## How the Code Works 🔍

### Constants 🔢

At the beginning of the script, these constants define key configurations:

```python
INPUT_DIRECTORY = 'audio_input'  # Folder for unprocessed MP3s
OUTPUT_DIRECTORY = 'audio_output'  # Folder for processed MP3s
PORT = 8080  # The server port
SILENCE_THRESHOLD = -50.0  # dB level for silence detection
CERT_FILE = 'cert.pem'  # SSL certificate file
KEY_FILE = 'key.pem'  # SSL key file
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


