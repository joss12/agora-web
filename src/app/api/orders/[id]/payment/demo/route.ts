import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface DemoPaymentBody {
  outcome: "SUCCESS" | "FAILURE";
}

interface BackendError {
  message?: string;
  detail?: string;
  error?: string;
  status?: number;
}

function isValidPaymentBody(
  value: unknown
): value is DemoPaymentBody {
  if (
    typeof value !== "object" ||
    value === null ||
    !("outcome" in value)
  ) {
    return false;
  }

  return (
    value.outcome === "SUCCESS" ||
    value.outcome === "FAILURE"
  );
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  // Validate order ID
  if (!/^[1-9]\d*$/.test(id)) {
    return NextResponse.json(
      { message: "Invalid order ID." },
      { status: 400 }
    );
  }

  // Parse request body
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  // Validate payment outcome
  if (!isValidPaymentBody(body)) {
    return NextResponse.json(
      {
        message:
          "Payment outcome must be SUCCESS or FAILURE.",
      },
      { status: 400 }
    );
  }

  try {
    // Forward request to Spring Boot
    const response = await backendFetch(
      `/api/orders/${id}/payment/demo`,
      {
        method: "POST",
        body: JSON.stringify({
          outcome: body.outcome,
        }),
      }
    );

    // Handle empty response
    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
      });
    }

    const data: unknown = await response
      .json()
      .catch(() => null);

    // Handle backend errors
    if (!response.ok) {
      const backendError: BackendError =
        data !== null && typeof data === "object"
          ? (data as BackendError)
          : {};

      let message =
        backendError.message ||
        backendError.detail;

      if (!message) {
        switch (response.status) {
          case 401:
            message =
              "Your session has expired. Please sign in again.";
            break;

          case 403:
            message =
              "You do not have permission to simulate this payment.";
            break;

          case 404:
            message =
              "The order or payment could not be found.";
            break;

          case 409:
            message =
              "This order is not eligible for demo payments. It may already be paid or associated with Toss Payments.";
            break;

          default:
            message =
              "Unable to simulate payment. Please try again.";
        }
      }

      return NextResponse.json(
        { message },
        { status: response.status }
      );
    }

    // Return demo payment result
    return NextResponse.json(data, {
      status: response.status,
    });

  } catch (error) {
    console.error(
      "[DemoPaymentAPI] Request failed:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to reach the demo payment service.",
      },
      { status: 502 }
    );
  }
}
