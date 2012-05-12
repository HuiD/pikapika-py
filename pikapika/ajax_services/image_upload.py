from __future__ import unicode_literals, print_function

import os
import random
import string
from datetime import datetime

from django.conf import settings
from django.core.files.storage import default_storage
import Image

from pikapika.http import JsonResponseBadRequest
from .decorators import register_service, generic_ajax_func, require_staff

FILE_NAME_FORMAT = "%Y%m%d-%H%M%S-{random}.{extension}"
RANDOM_LENGTH = 8
FORMAT_EXTENSION = {
    "JPEG": "jpg",
    "PNG": "png",
    "GIF": "gif",
}

def generate_file_path(extension):
    random_str = "".join(
        [random.choice(string.ascii_lowercase) for x in range(RANDOM_LENGTH))]
    )
    return datetime.now.strftime(os.path.join(
        settings.IMAGE_UPLOAD_DIR,
        FILE_NAME_FORMAT.format(random=random_str, extension=extension, )
    ))

@register_service
@require_staff
@generic_ajax_func
def upload_from_local(request):
    file = request.FILES["file"]
    if not file:
        return JsonResponseBadRequest("There is no file in the request")

    try:
        im = Image.open(file)
        im.verify()
        extension = FORMAT_EXTENSION.get(im.format, None)
        del im
        if not extension:
            return JsonResponseBadRequest("Unsupported image format")

        file_path = generate_file_path(extension)
        # Re-open the file to ensure position is at the beginning
        file.open()
        real_name = default_storage.save(file_path, file)
        return {"name": real_name}
    except IOError:
        return JsonResponseBadRequest("Invalid image file")