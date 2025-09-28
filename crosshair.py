import sys
import os
import json
import time
from math import sin

from PySide6.QtWidgets import QApplication, QWidget
from PySide6.QtGui import QPainter, QColor, QPen
from PySide6.QtCore import Qt, QTimer, QRectF

QT = 'PySide6'

if sys.platform == "win32":
    import ctypes
    from ctypes import wintypes

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(HERE, 'config.json')

DEFAULT_CONFIG = {
    "style": "cross",  # cross, dot, circle, square
    "size": 20,
    "thickness": 2,
    "gap": 3,
    "offsetX": 0,
    "offsetY": 0,
    "color": "#00ff41",
    "opacity": 1.0,
    "modules": {
        "dynamicColor": False,
        "outline": False,
        "centerDot": True,
        "pulsing": False
    }
}

def load_config():
    try:
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            cfg = json.load(f)
            cfg['opacity'] = float(cfg.get('opacity', 1.0))
            cfg['size'] = int(cfg.get('size', 20))
            cfg['thickness'] = int(cfg.get('thickness', 2))
            cfg['gap'] = int(cfg.get('gap', 3))
            cfg['offsetX'] = int(cfg.get('offsetX', 0))
            cfg['offsetY'] = int(cfg.get('offsetY', 0))
            cfg['modules'] = cfg.get('modules', {})
            return cfg
    except Exception:
        return DEFAULT_CONFIG.copy()


class CrosshairOverlay(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle('Crosshair Overlay')

        flags = Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint | Qt.Tool
        self.setWindowFlags(flags)
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setAttribute(Qt.WA_TransparentForMouseEvents)  
        screen = QApplication.primaryScreen()
        geom = screen.geometry()
        self.setGeometry(geom)
        self.config = load_config()
        self.last_mtime = os.path.getmtime(CONFIG_PATH) if os.path.exists(CONFIG_PATH) else 0
        self.start_time = time.time()
        self.repaint_timer = QTimer(self)
        self.repaint_timer.timeout.connect(self.on_tick)
        self.repaint_timer.start(16)
        self.check_timer = QTimer(self)
        self.check_timer.timeout.connect(self.check_config)
        self.check_timer.start(400)
        if sys.platform == "win32":
            hwnd = self.winId().__int__()
            GWL_EXSTYLE = -20
            WS_EX_LAYERED     = 0x80000
            WS_EX_TRANSPARENT = 0x20
            WS_EX_TOOLWINDOW  = 0x00000080
            WS_EX_APPWINDOW   = 0x00040000
            style = ctypes.windll.user32.GetWindowLongW(hwnd, GWL_EXSTYLE)
            style = style | WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOOLWINDOW
            style = style & ~WS_EX_APPWINDOW
            ctypes.windll.user32.SetWindowLongW(hwnd, GWL_EXSTYLE, style)

    def check_config(self):
        try:
            if os.path.exists(CONFIG_PATH):
                mtime = os.path.getmtime(CONFIG_PATH)
                if mtime != self.last_mtime:
                    self.last_mtime = mtime
                    self.config = load_config()
                    self.update()
        except Exception:
            pass

    def on_tick(self):
        modules = self.config.get('modules', {})
        if modules.get('pulsing') or modules.get('dynamicColor'):
            self.update()

    def paintEvent(self, event):
        cfg = self.config
        size = cfg.get('size', 20)
        thr = cfg.get('thickness', 2)
        gap = cfg.get('gap', 3)
        ox = cfg.get('offsetX', 0)
        oy = cfg.get('offsetY', 0)
        color_hex = cfg.get('color', '#00ff41')
        opacity = max(0.0, min(1.0, float(cfg.get('opacity', 1.0))))
        modules = cfg.get('modules', {})

        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        base_color = QColor(color_hex)
        if modules.get('dynamicColor'):
            t = time.time() - self.start_time
            h = int((t * 60) % 360)
            base_color = QColor.fromHsv(h, 255, 255)

        base_color.setAlphaF(opacity)

        w = self.width()
        h = self.height()
        cx = w / 2 + ox
        cy = h / 2 + oy

        pulse_scale = 1.0
        if modules.get('pulsing'):
            p = 0.5 + 0.5 * sin((time.time() - self.start_time) * 2 * 3.1415 / 1.2)
            pulse_scale = 0.9 + 0.2 * p

        style = cfg.get('style', 'cross')

        pen = QPen(base_color)
        pen.setWidth(max(1, int(thr)))
        pen.setCapStyle(Qt.RoundCap)
        painter.setPen(pen)

        if style == 'cross':
            length = size * pulse_scale
            half = length / 2
            painter.drawLine(cx - half - gap, cy, cx - gap, cy)
            painter.drawLine(cx + gap, cy, cx + half + gap, cy)
            painter.drawLine(cx, cy - half - gap, cx, cy - gap)
            painter.drawLine(cx, cy + gap, cx, cy + half + gap)

            if modules.get('centerDot'):
                dot_radius = max(1, thr)
                painter.setBrush(base_color)
                painter.drawEllipse(QRectF(cx - dot_radius/2, cy - dot_radius/2, dot_radius, dot_radius))

        elif style == 'dot':
            r = size * pulse_scale / 2
            painter.setBrush(base_color)
            painter.drawEllipse(QRectF(cx - r, cy - r, r*2, r*2))

        elif style == 'circle':
            pen_circle = QPen(base_color)
            pen_circle.setWidth(max(1, int(thr)))
            painter.setPen(pen_circle)
            r = size * pulse_scale / 2
            painter.drawEllipse(QRectF(cx - r, cy - r, r*2, r*2))

        elif style == 'square':
            pen_sq = QPen(base_color)
            pen_sq.setWidth(max(1, int(thr)))
            painter.setPen(pen_sq)
            s = size * pulse_scale
            painter.drawRect(QRectF(cx - s/2, cy - s/2, s, s))

        if modules.get('outline'):
            outline_color = QColor(0, 0, 0)
            outline_color.setAlphaF(max(0.2, opacity * 0.7))
            pen_out = QPen(outline_color)
            pen_out.setWidth(2)
            painter.setPen(pen_out)
            painter.setBrush(Qt.NoBrush)

            if style == 'cross':
                painter.drawLine(cx - size/2 - gap, cy, cx + size/2 + gap, cy)
                painter.drawLine(cx, cy - size/2 - gap, cx, cy + size/2 + gap)
            elif style == 'dot' or style == 'circle':
                r = size / 2
                painter.drawEllipse(QRectF(cx - r, cy - r, r*2, r*2))
            elif style == 'square':
                s = size
                painter.drawRect(QRectF(cx - s/2, cy - s/2, s, s))

        painter.end()


if __name__ == '__main__':
    app = QApplication(sys.argv)
    app.aboutToQuit.connect(lambda: os._exit(0))
    overlay = CrosshairOverlay()
    overlay.show()
    print(f"Overlay started using {QT}. Editing config.json will update the overlay.")
    sys.exit(app.exec())
