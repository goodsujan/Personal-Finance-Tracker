from django.http import JsonResponse


def axes_lockout_response(request, credentials, *args, **kwargs):
    return JsonResponse(
        {
            'error': 'Too many failed login attempts. '
                     'Your account has been locked for 15 minutes.'
        },
        status=429
    )
