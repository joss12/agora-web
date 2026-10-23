import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface SimulatePaymentBody {
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
): value is SimulatePaymentBody {
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

  if (!/^[1-9]\d*$/.test(id)) {
    return NextResponse.json(
      { message: "Invalid order ID" },
      { status: 400 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!isValidPaymentBody(body)) {
    return NextResponse.json(
      {
        message:
          "Payment outcome must be SUCCESS or FAILURE",
      },
      { status: 400 }
    );
  }

  try {
    const response = await backendFetch(
      `/api/orders/${id}/payment/simulate`,
      {
        method: "POST",
        body: JSON.stringify({
          outcome: body.outcome,
        }),
      }
    );

    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
      });
    }

    const data: unknown = await response
      .json()
      .catch(() => null);

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
              "Simulated payments are disabled in this environment.";
            break;

          case 404:
            message =
              "The order or payment could not be found.";
            break;

          case 409:
            message =
              "Payment cannot be simulated for this order. If Toss Payments was started, complete or resolve that payment first.";
            break;

          default:
            message =
              "Unable to process payment. Please try again.";
        }
      }

      return NextResponse.json(
        { message },
        { status: response.status }
      );
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "Unable to reach the payment service.",
      },
      { status: 502 }
    );
  }
}
