import {
  BatchV1Api,
  type BatchV1ApiCreateNamespacedJobRequest,
  KubeConfig,
} from "@kubernetes/client-node";

const kubectl = new KubeConfig();
if (process.env.APP_ENV === "production") {
  kubectl.loadFromCluster();
} else {
  kubectl.loadFromDefault();
}

const apiClient = kubectl.makeApiClient(BatchV1Api);

export const processVideo = async (id: string, name: string) => {
  const videoProcessingJobRequest: BatchV1ApiCreateNamespacedJobRequest = {
    namespace: "quillstream",
    body: {
      kind: "Job",
      apiVersion: "batch/v1",
      metadata: { name: id },
      spec: {
        ttlSecondsAfterFinished: 10,
        backoffLimit: 1,
        template: {
          spec: {
            restartPolicy: "Never",
            volumes: [
              { name: "secret", emptyDir: {} },
              {
                name: "worker-secret",
                secret: {
                  secretName: "quillstream-worker-secret",
                  items: [{ key: ".env", path: "worker.env" }],
                },
              },
              {
                name: "shared-secret",
                secret: {
                  secretName: "quillstream-shared-secret",
                  items: [{ key: ".env", path: "shared.env" }],
                },
              },
            ],
            initContainers: [
              {
                name: "busybox",
                image: "busybox:1.36",
                command: ["/bin/sh", "-c"],
                args: [
                  "cat /secrets/worker-env/worker.env /secrets/shared-env/shared.env > /merged-env/.env",
                ],
                volumeMounts: [
                  {
                    name: "worker-secret",
                    mountPath: "/secrets/worker-env",
                  },
                  {
                    name: "shared-secret",
                    mountPath: "/secrets/shared-env",
                  },
                  { name: "secret", mountPath: "/merged-env" },
                ],
              },
            ],
            containers: [
              {
                name: "quillstream-worker",
                image: "jkrishil/quillstream-worker:latest",
                imagePullPolicy: "IfNotPresent",
                env: [
                  { name: "VIDEO_ID", value: id },
                  { name: "VIDEO_NAME", value: name },
                ],
                volumeMounts: [
                  { name: "secret", mountPath: "/app/.env", subPath: ".env" },
                ],
              },
            ],
          },
        },
      },
    },
  };

  await apiClient.createNamespacedJob(videoProcessingJobRequest);
};
