<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

final class CsrfProtectionSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::REQUEST => ['validateCsrfToken', 7]];
    }

    public function validateCsrfToken(RequestEvent $event): void
    {
        $request = $event->getRequest();
        if (!$event->isMainRequest()
            || !str_starts_with($request->getPathInfo(), '/api/')
            || in_array($request->getMethod(), ['GET', 'HEAD', 'OPTIONS'], true)
        ) {
            return;
        }

        $cookieToken = $request->cookies->get('CSRF_TOKEN');
        $headerToken = $request->headers->get('X-CSRF-Token');
        if (!is_string($cookieToken)
            || $cookieToken === ''
            || !is_string($headerToken)
            || !hash_equals($cookieToken, $headerToken)
        ) {
            $event->setResponse(new JsonResponse(['detail' => 'Jeton CSRF invalide ou manquant.'], 403));
        }
    }
}
