import os
import shutil
import subprocess
import sys

FONT_LIST = [
    "arial.ttf",
    "times.ttf",
    "cour.ttf",
    "verdana.ttf",
    "montserrat.ttf",
]

FONT_DATA = {
    "Arial":"arial.ttf",
    "Times New Roman":"times.ttf",
    "Courier New":"cour.ttf",
    "Verdana":"verdana.ttf",
    "Montserrat":"montserrat.ttf",
}

def get_path(font_name: str):
    """Получить путь до шрифта"""
    file_name = FONT_DATA.get(font_name, None)
    return os.path.join(os.getcwd(), 'fonts', file_name).replace("\\", "\\\\") if file_name else None


def install_font_from_file(font_file):
    """Устанавливает шрифт из файла и регистрирует его в системе"""
    try:
        if not os.path.exists(font_file):
            print(f"Файл {font_file} не существует.")
            return

        if sys.platform == "win32":
            # Windows
            font_dir = os.path.join(os.environ['WINDIR'], 'Fonts')
            destination = os.path.join(font_dir, os.path.basename(font_file))
            print(f"Копируем {font_file} в {font_dir}")
            shutil.copy(font_file, destination)
            
            # Регистрация шрифта с помощью fontreg
            print("Регистрируем шрифт...")
            subprocess.run(["fontreg", "/copy"], check=True)
            print(f"Шрифт {font_file} успешно установлен и зарегистрирован.")
        elif sys.platform == "darwin":
            # macOS
            font_dir = os.path.expanduser('~/Library/Fonts')
            print(f"Копируем {font_file} в {font_dir}")
            shutil.copy(font_file, font_dir)
            print(f"Шрифт {font_file} успешно установлен.")
        elif sys.platform == "linux":
            # Linux
            font_dir = os.path.expanduser('~/.fonts')
            if not os.path.exists(font_dir):
                os.makedirs(font_dir)
            print(f"Копируем {font_file} в {font_dir}")
            shutil.copy(font_file, font_dir)
            print(f"Шрифт {font_file} успешно установлен.")
        else:
            raise OSError(f"Unsupported operating system: {sys.platform}")
    except subprocess.CalledProcessError as e:
        print(f"Ошибка при регистрации шрифта {font_file}: {e}")
    except Exception as e:
        print(f"Ошибка при установке шрифта {font_file}: {e}")

def is_font_installed(font_file):
    """Проверяет, установлен ли шрифт"""
    try:
        from matplotlib.font_manager import findSystemFonts

        font_name = os.path.basename(font_file).lower()
        installed_fonts = findSystemFonts(fontpaths=None, fontext='ttf')
        for font in installed_fonts:
            if font_name in font.lower():
                return True
        return False
    except ImportError:
        print("Для проверки шрифтов необходимо установить библиотеку matplotlib.")
        sys.exit(1)

def ensure_fonts_installed(font_files):
    """Проверяет и устанавливает шрифты из файлов, если они не установлены"""
    for font_file in font_files:
        full_path = os.path.join(os.getcwd(), 'fonts', font_file)
        if not is_font_installed(full_path):
            print(f"Шрифт {full_path} не установлен. Устанавливаем...")
            install_font_from_file(full_path)
        else:
            print(f"Шрифт {full_path} уже установлен.")
