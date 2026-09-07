# Bakes the Envoy config/entrypoint into the image at build time instead of
# bind-mounting individual files at runtime — some hosts fail to bind-mount
# a single file with "not a directory" even when the source clearly exists
# (see docker-compose.yml api-gw service).
FROM envoyproxy/envoy:v1.39.0

COPY envoy.yaml /etc/envoy/envoy.yaml
COPY cds.yaml /etc/envoy/cds.yaml
COPY lds.template.yaml /etc/envoy/lds.template.yaml
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
