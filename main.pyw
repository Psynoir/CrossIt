import webview
import os
import json
import sys
import subprocess
import atexit

HERE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(HERE, 'index.html')
CONFIG_PATH = os.path.join(HERE, 'config.json')

class API:
    def save_config(self, settings):
        try:
            settings['size'] = int(settings.get('size', 20))
            settings['thickness'] = int(settings.get('thickness', 2))
            settings['gap'] = int(settings.get('gap', 3))
            settings['offsetX'] = int(settings.get('offsetX', 0))
            settings['offsetY'] = int(settings.get('offsetY', 0))
            settings['opacity'] = float(settings.get('opacity', 1.0))
            settings['modules'] = settings.get('modules', {})

            tmp = CONFIG_PATH + '.tmp'
            with open(tmp, 'w', encoding='utf-8') as f:
                json.dump(settings, f, indent=2)
            os.replace(tmp, CONFIG_PATH)
            return True
        except Exception as e:
            print('save_config error:', e)
            return False

    def load_config(self):
        try:
            if os.path.exists(CONFIG_PATH):
                with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception:
            pass
        return {
            "style": "cross",
            "size": 20,
            "thickness": 2,
            "gap": 3,
            "offsetX": 0,
            "offsetY": 0,
            "color": "#00ff41",
            "opacity": 1.0,
            "modules": {"dynamicColor": False, "outline": False, "centerDot": True, "pulsing": False}
        }


def start_crosshair_process():
    crosshair_path = os.path.join(HERE, 'crosshair.py')
    if not os.path.exists(crosshair_path):
        print('crosshair.py not found')
        return None
    try:
        # ВЫЗЫВАЕТСЯ creationflags=subprocess.CREATE_NO_WINDOW
        kwargs = {}
        if sys.platform == 'win32':
            kwargs['creationflags'] = 0x08000000  # CREATE_NO_WINDOW
        p = subprocess.Popen([sys.executable, crosshair_path], cwd=HERE, **kwargs)
        print('Started crosshair.py pid=', p.pid)
        return p
    except Exception as e:
        print('Failed to start crosshair.py:', e)
        return None


if __name__ == '__main__':
    proc = start_crosshair_process()

    def cleanup():
        try:
            if proc and proc.poll() is None:
                proc.terminate()
        except Exception:
            pass
    atexit.register(cleanup)

    file_path = f"file://{INDEX}"
    api = API()
    window = webview.create_window('CrossIt', file_path, width=600, height=300, resizable=True, background_color="#353535", js_api=api)
    webview.start()
