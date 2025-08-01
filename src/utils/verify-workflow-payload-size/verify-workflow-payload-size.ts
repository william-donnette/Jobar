function getJsonSizeInBytes(obj: any): number {
	const jsonString = JSON.stringify(obj);
	return new TextEncoder().encode(jsonString).length;
}

export function verifyWorkflowPayloadSize(args: any, maxMB: number = 4) {
	const maxBytes = maxMB * 1024 * 1024;
	const size = getJsonSizeInBytes(args);
	if (size > maxBytes) {
		throw new Error(
			`Workflow payload exceeds ${maxMB}MB : ${Math.round(
				size / 1024
			)} KB. Temporal gRPC has a limit of 4 MB for each message received. https://docs.temporal.io/self-hosted-guide/defaults`
		);
	}
}
