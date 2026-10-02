# Architecture

## Overview

This project is a client-side AWS resource dashboard built with React. It has no application backend: the browser sends requests directly to an AWS endpoint supplied by the user. The endpoint can be an AWS-compatible local service, such as the `ministackorg/ministack` container running on `localhost:4566`, or an appropriately configured AWS endpoint.

The initial resource workflow focuses on Amazon SQS. Users can inspect queues and perform supported queue operations from the dashboard. The application is intended to make local development and testing possible without deploying an application server.

## Application layers

- **Routing and application shell:** React Router organizes the dashboard routes and shared page layout.
- **User interface:** Tailwind CSS provides utility-based styling, and shadcn/ui-inspired primitives are used to build reusable interface components without depending on a one-off generated component command.
- **AWS access:** Client-side service code uses an AWS-compatible client to send requests from the browser to the configured endpoint. Resource operations belong in this layer rather than in view components.
- **Configuration:** The endpoint and any non-secret connection settings are provided to the client-side application. The endpoint is not hard-coded to a production AWS account; for local use it points to the local emulator.

## Request flow

1. The user opens the dashboard and provides or selects the AWS-compatible endpoint.
2. The application configures its browser-side AWS service client with that endpoint and the required region and credentials for the selected environment.
3. A route or UI action requests an operation, such as listing SQS queues or sending a message.
4. The client sends the request directly from the browser to the configured endpoint.
5. The response is rendered in the dashboard, and request failures are surfaced to the user.

There is no application server between the browser and the AWS-compatible service. Consequently, the service endpoint must be reachable from the browser, and the service must permit the browser's cross-origin requests (CORS) where applicable.

## Local development and testing

Run `ministackorg/ministack` as a Docker container and expose its AWS-compatible API on port `4566`. Configure the dashboard to use `http://localhost:4566` as its endpoint. The dashboard and the container are separate processes: the React development server serves the frontend, while the container emulates the AWS APIs used by the application.

Local tests should verify that the dashboard can connect to the configured endpoint, list SQS queues, and perform the queue operations supported by the UI. Tests that mutate resources should use the local emulator and disposable test queues rather than a production AWS account.

## Security and operational boundaries

Because AWS requests originate in the browser, this application does not provide a secure place to store long-lived AWS credentials. Never bundle permanent access keys or secrets into frontend source, build-time environment variables, or browser storage. Use the local emulator for local development; for real AWS environments, use an explicitly designed short-lived credential flow and restrict permissions to the required resources and actions.

The browser must be able to reach the configured endpoint, and endpoint networking and CORS policy are the responsibility of that endpoint's environment. The frontend is responsible for presenting resource state and user actions, not for enforcing server-side authorization or protecting credentials.