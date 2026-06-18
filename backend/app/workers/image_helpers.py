from PIL import Image, ImageOps

from app.workers.conversion_helpers import complete_job, outputs_dir


def open_image(input_path):
    image = Image.open(input_path)
    return ImageOps.exif_transpose(image)


def save_image_job(db, job, image, output_name, image_format, **save_options):
    output_path = outputs_dir() / output_name
    image.save(output_path, image_format, **save_options)
    complete_job(db, job, output_path)
