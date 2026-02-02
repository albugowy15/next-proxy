"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

interface ResponseData {
  status: number;
  statusText: string;
  headers: Headers;
  body: string;
  time: number;
}

interface RequestParams {
  url: string;
  method: string;
  body?: string;
}

async function sendRequest({
  url,
  method,
  body,
}: RequestParams): Promise<ResponseData> {
  const startTime = performance.now();

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (method !== "GET" && body?.trim()) {
    fetchOptions.body = body;
  }

  const res = await fetch(url, fetchOptions);
  const endTime = performance.now();

  const contentType = res.headers.get("content-type") || "text/plain";
  let bodyText: string;

  if (contentType.includes("application/json")) {
    try {
      const json = await res.json();
      bodyText = JSON.stringify(json, null, 2);
    } catch {
      bodyText = await res.text();
    }
  } else if (contentType.includes("image/")) {
    const blob = await res.blob();
    bodyText = URL.createObjectURL(blob);
  } else if (
    contentType.includes("text/") ||
    contentType.includes("application/xml") ||
    contentType.includes("application/javascript")
  ) {
    bodyText = await res.text();
  } else {
    bodyText = `[Binary content: ${contentType}]`;
  }

  return {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
    body: bodyText,
    time: Math.round(endTime - startTime),
  };
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [requestBody, setRequestBody] = useState("");

  const mutation = useMutation({
    mutationFn: sendRequest,
  });

  function handleSend() {
    if (!url.trim()) {
      return;
    }
    mutation.mutate({ url, method, body: requestBody });
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-500";
    if (status >= 300 && status < 400) return "text-yellow-500";
    if (status >= 400 && status < 500) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Request Section */}
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {/* Method Selector */}
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>

              {/* URL Input */}
              <Input
                type="text"
                placeholder="Enter request URL"
                className="flex-1"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />

              {/* Send Button */}
              <Button onClick={handleSend} disabled={mutation.isPending}>
                {mutation.isPending ? "Sending..." : "Send"}
              </Button>
            </div>

            {/* Request Body */}
            {method !== "GET" && (
              <div className="space-y-2">
                <Label htmlFor="body">Request Body (JSON)</Label>
                <Textarea
                  id="body"
                  placeholder='{"key": "value"}'
                  className="font-mono min-h-[120px]"
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {mutation.isError && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "Request failed"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Response Section */}
        {mutation.isSuccess && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                <span>Response</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Status:{" "}
                  <span
                    className={`font-medium ${getStatusColor(mutation.data.status)}`}
                  >
                    {mutation.data.status} {mutation.data.statusText}
                  </span>
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  Time:{" "}
                  <span className="font-medium">{mutation.data.time}ms</span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="body">
                <TabsList>
                  <TabsTrigger value="body">Body</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                </TabsList>
                <TabsContent value="body">
                  {mutation.data.headers
                    .get("Content-Type")
                    ?.includes("image/") ? (
                    <div className="bg-muted rounded-lg p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mutation.data.body}
                        alt="Response"
                        className="max-w-full h-auto"
                      />
                    </div>
                  ) : (
                    <pre className="bg-muted rounded-lg p-4 overflow-auto max-h-96 text-sm font-mono whitespace-pre-wrap">
                      {mutation.data.body || "(empty response)"}
                    </pre>
                  )}
                </TabsContent>
                <TabsContent value="headers">
                  <div className="bg-muted rounded-lg p-4 overflow-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="pb-2 pr-4">Key</th>
                          <th className="pb-2">Value</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono">
                        {mutation.data.headers.entries().map(([key, value]) => (
                          <tr key={key} className="border-t">
                            <td className="py-2 pr-4">{key}</td>
                            <td className="py-2">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {mutation.isIdle && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Enter a URL and click Send to make a request
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {mutation.isPending && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Sending request...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
