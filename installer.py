import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import subprocess
import os
import sys
import threading
import json
import urllib.request
from pathlib import Path
import ctypes
import platform

class InstallerGUI:
    def __init__(self, root):
        self.root = root
        self.servers_running = False
        self.server_processes = []
        self.root.title("Navarch Installer & Server Manager")
        self.root.geometry("800x600")
        self.root.resizable(True, True)

        if self.is_windows() and not self.is_admin():
            self.request_admin()
            return

        self.setup_ui()

    def is_windows(self):
        return platform.system() == "Windows"

    def is_linux(self):
        return platform.system() == "Linux"

    def is_admin(self):
        if self.is_windows():
            try:
                return ctypes.windll.shell32.IsUserAnAdmin()
            except:
                return False
        elif self.is_linux():
            return os.geteuid() == 0
        return True

    def request_admin(self):
        if self.is_windows():
            try:
                ctypes.windll.shell32.ShellExecuteW(
                    None, "runas", sys.executable, " ".join(sys.argv), None, 1
                )
            except:
                messagebox.showerror("Error", "Administrator privileges required!")
            finally:
                self.root.quit()
        elif self.is_linux():
            messagebox.showerror("Error", "Please run this script as root using: sudo python3 installer.py")
            self.root.quit()

    def setup_ui(self):
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(4, weight=1)

        title_label = ttk.Label(main_frame, text="Navarch Installer & Server Manager",
                                font=("Arial", 16, "bold"))
        title_label.grid(row=0, column=0, columnspan=2, pady=(0, 20))

        buttons_frame = ttk.Frame(main_frame)
        buttons_frame.grid(row=1, column=0, columnspan=2, pady=(0, 10), sticky=(tk.W, tk.E))
        for i in range(3):
            buttons_frame.columnconfigure(i, weight=1)

        self.install_btn = ttk.Button(buttons_frame, text="🔧 Install Dependencies",
                                      command=self.run_installer, width=20)
        self.install_btn.grid(row=0, column=0, padx=(0, 5), sticky=(tk.W, tk.E))

        self.start_btn = ttk.Button(buttons_frame, text="🚀 Start Navarch", command=self.toggle_servers)
        self.start_btn.grid(row=0, column=1, padx=5, sticky=(tk.W, tk.E))

        self.close_btn = ttk.Button(buttons_frame, text="❌ Close", command=self.close_app)
        self.close_btn.grid(row=0, column=2, padx=(5, 0), sticky=(tk.W, tk.E))

        self.progress = ttk.Progressbar(main_frame, mode='indeterminate')
        self.progress.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))

        self.status_label = ttk.Label(main_frame, text="Ready to install")
        self.status_label.grid(row=3, column=0, columnspan=2, pady=(0, 10))

        self.output_text = scrolledtext.ScrolledText(main_frame, height=20, width=80)
        self.output_text.grid(row=4, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S))

        self.output_text.tag_configure("success", foreground="green")
        self.output_text.tag_configure("error", foreground="red")
        self.output_text.tag_configure("info", foreground="blue")
        self.output_text.tag_configure("warning", foreground="orange")

    def log_output(self, message, tag="normal"):
        self.output_text.insert(tk.END, f"{message}\n", tag)
        self.output_text.see(tk.END)
        self.root.update_idletasks()

    def run_command(self, command, cwd=None):
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                cwd=cwd
            )
            return result.returncode == 0, result.stdout, result.stderr
        except Exception as e:
            return False, "", str(e)

    def run_and_log(self, command, success_msg, error_msg):
        success, _, stderr = self.run_command(command)
        if success:
            self.log_output(f"✅ {success_msg}", "success")
        else:
            self.log_output(f"❌ {error_msg}: {stderr}", "error")
        return success

    def check_node_js(self):
        self.log_output("Checking for Node.js...", "info")
        success, stdout, _ = self.run_command("node --version")
        if success:
            self.log_output(f"✅ Node.js is installed: {stdout.strip()}", "success")
            return True
        else:
            self.log_output("❌ Node.js is not installed", "error")
            return False

    def install_node_js(self):
        if self.is_windows():
            self.log_output("Installing Node.js...", "info")
            return self.run_and_log(
                "winget install --silent --accept-package-agreements --accept-source-agreements OpenJS.NodeJS",
                "Node.js installed successfully",
                "Failed to install Node.js"
            )
        else:
            self.log_output("Installing Node.js for Linux...", "info")
            return self.run_and_log(
                "sudo pacman -Sy --noconfirm nodejs npm",
                "Node.js and NPM installed",
                "Failed to install Node.js on Linux"
            )

    def check_java(self):
        self.log_output("Checking for Java JDK...", "info")
        success, stdout, _ = self.run_command("java --version")
        if success:
            for line in stdout.splitlines():
                if 'version' in line.lower():
                    try:
                        version_str = line.split()[1].strip('"')
                        major_version = int(version_str.split('.')[0])
                        if major_version >= 21:
                            self.log_output(f"✅ Java JDK {version_str} is installed", "success")
                            return True
                        else:
                            self.log_output(f"⚠️ Java version {version_str} is too old (need 21+)", "warning")
                            return False
                    except:
                        pass
        self.log_output("❌ Java JDK 21+ is not installed", "error")
        return False

    def install_java(self):
        if self.is_windows():
            self.log_output("Installing OpenJDK 21...", "info")
            return self.run_and_log(
                "winget install EclipseAdoptium.Temurin.21.JDK --silent --accept-package-agreements --accept-source-agreements",
                "OpenJDK 21 installed successfully",
                "Failed to install OpenJDK 21"
            )
        else:
            self.log_output("Installing OpenJDK 21 for Linux...", "info")
            return self.run_and_log(
                "sudo pacman -Sy --noconfirm jdk-openjdk",
                "OpenJDK installed",
                "Failed to install OpenJDK 21 on Linux"
            )

    def check_minecraft_server(self):
        self.log_output("Checking for Minecraft server JAR...", "info")
        server_path = Path("server/server.jar")

        if server_path.exists():
            self.log_output("✅ server.jar already exists", "success")
            return True

        self.log_output("server.jar not found. Setting up Minecraft server...", "warning")
        Path("server").mkdir(exist_ok=True)

        try:
            with urllib.request.urlopen("https://launchermeta.mojang.com/mc/game/version_manifest.json") as response:
                version_data = json.loads(response.read().decode())

            latest_version = version_data["latest"]["release"]
            version_info = next(v for v in version_data["versions"] if v["id"] == latest_version)

            with urllib.request.urlopen(version_info["url"]) as response:
                version_json = json.loads(response.read().decode())

            server_jar_url = version_json["downloads"]["server"]["url"]
            urllib.request.urlretrieve(server_jar_url, server_path)

            if server_path.exists():
                self.log_output("✅ Minecraft server.jar downloaded successfully", "success")
                return True
        except Exception as e:
            self.log_output(f"❌ Failed to download server.jar: {str(e)}", "error")
        return False

    def install_npm_dependencies(self):
        self.log_output("Installing NPM dependencies...", "info")

        for name, path in [("front-end", "front-end"), ("back-end", "api")]:
            if not Path(f"{path}/node_modules").exists():
                self.log_output(f"Installing {name} dependencies...", "info")
                success, _, stderr = self.run_command("npm install", cwd=path)
                if not success:
                    self.log_output(f"❌ Failed to install {name} dependencies: {stderr}", "error")
                    return False
                self.log_output(f"✅ {name.capitalize()} dependencies installed", "success")
            else:
                self.log_output(f"✅ {name.capitalize()} dependencies already installed", "success")

        self.log_output("Installing serve globally...", "info")
        success, _, stderr = self.run_command("npm install -g serve")
        if success:
            self.log_output("✅ Serve installed globally", "success")
        else:
            self.log_output(f"⚠️ Warning: Failed to install serve globally: {stderr}", "warning")
            if self.is_linux():
                messagebox.showwarning(
                    "Permission Error",
                    "Could not install 'serve' globally due to permissions. You can install it manually with:\n\n  sudo npm install -g serve"
                )

        return True

    def run_installer_thread(self):
        try:
            self.progress.start()
            self.status_label.config(text="Installing dependencies...")
            self.install_btn.config(state="disabled")

            self.log_output("=== Running setup scripts... ===", "info")

            if not self.check_node_js() and not self.install_node_js():
                raise Exception("Failed to install Node.js")

            if not self.check_java() and not self.install_java():
                raise Exception("Failed to install Java JDK")

            if not self.check_minecraft_server():
                raise Exception("Failed to setup Minecraft server")

            if not self.install_npm_dependencies():
                raise Exception("Failed to install NPM dependencies")

            self.log_output("✅ All scripts completed successfully!", "success")
            self.status_label.config(text="Installation completed successfully")
            messagebox.showinfo("Success", "Installation completed successfully!")

        except Exception as e:
            self.log_output(f"❌ Installation failed: {str(e)}", "error")
            self.status_label.config(text="Installation failed")
            messagebox.showerror("Error", f"Installation failed: {str(e)}")
        finally:
            self.progress.stop()
            self.install_btn.config(state="normal")

    def run_installer(self):
        threading.Thread(target=self.run_installer_thread, daemon=True).start()

    def toggle_servers(self):
        if self.servers_running:
            self.stop_servers()
        else:
            threading.Thread(target=self.start_servers_thread, daemon=True).start()

    def start_servers_thread(self):
        try:
            self.progress.start()
            self.status_label.config(text="Starting servers...")
            self.start_btn.config(state="disabled")

            self.log_output("🚀 Starting backend server...", "info")
            backend_proc = subprocess.Popen("npm start", cwd="api", shell=True)

            self.log_output("🚀 Starting frontend server...", "info")
            frontend_proc = subprocess.Popen("serve -s build", cwd="front-end", shell=True)

            self.server_processes = [backend_proc, frontend_proc]
            self.servers_running = True

            self.start_btn.config(text="🛑 Stop Navarch")
            self.status_label.config(text="Servers running")
            self.log_output("✅ Servers started", "success")
        except Exception as e:
            self.log_output(f"❌ Failed to start servers: {str(e)}", "error")
            self.status_label.config(text="Server start failed")
        finally:
            self.progress.stop()
            self.start_btn.config(state="normal")

    def stop_servers(self):
        self.log_output("Stopping servers...", "info")
        for proc in self.server_processes:
            if proc.poll() is None:
                proc.terminate()
        self.server_processes.clear()
        self.servers_running = False
        self.start_btn.config(text="🚀 Start Navarch")
        self.status_label.config(text="Servers stopped")
        self.log_output("✅ Servers stopped", "success")

    def close_app(self):
        if self.servers_running:
            self.stop_servers()
        self.root.destroy()


if __name__ == '__main__':
    root = tk.Tk()
    app = InstallerGUI(root)
    root.mainloop()
