/* tracing.js */

const opentelemetry = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");

const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");
const { ConsoleSpanExporter, BatchSpanProcessor,AlwaysOnSampler,ParentBasedSampler,TraceIdRatioBasedSampler } = require("@opentelemetry/sdk-trace-base");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
//const { AlwaysOnSampler,ParentBasedSampler,TraceIdRatioBasedSampler } = require("@opentelemetry/core");
//const { OTLPTraceExporter,} = require("@opentelemetry/exporter-trace-otlp-http");
//const { PinoInstrumentation } = require('@opentelemetry/instrumentation-pino');
const resource =
  Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME || "STUDIUM",
      [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0",
    })
  );

const sdk = new opentelemetry.NodeSDK({
  resource:resource,
  spanProcessor:new BatchSpanProcessor(
    process.env.SERVER_SETUP === 'local'?
    new ConsoleSpanExporter(): new ZipkinExporter()
    ),
  /*spanProcessor:new BatchSpanProcessor(
    new OTLPTraceExporter({
      // optional - url default value is http://localhost:4318/v1/traces
      url: "http://localhost:4318/v1/traces",
      // optional - collection of custom headers to be sent with each request, empty by default
      headers: {},
    })),*/  
  instrumentations: [getNodeAutoInstrumentations()],
  sampler:process.env.SERVER_SETUP === 'local'
          ? new AlwaysOnSampler()
          : new ParentBasedSampler({
              root: new TraceIdRatioBasedSampler(1)
          })
});

sdk.start();

