import "server-only";
import {after} from "next/server";

export function scheduleCollectionStatistics(collectionId?: string) {
    after(async () => {
        try {
            if (!collectionId) {
                throw new Error("Missing collection ID");
            }
            const portalKey = process.env.STATISTICS_SERVICE_PORTAL_KEY;
            if (!portalKey) {
                throw new Error("STATISTICS_SERVICE_PORTAL_KEY is not configured");
            }

            const url = new URL("/stats", process.env.STATISTICS_SERVICE_BASE_URL
                || "http://ts4nfdi-api-gateway-collection-statistics:8000");
            url.searchParams.set("collection", collectionId);
            const response = await fetch(url, {
                method: "POST",
                headers: {"X-Portal-Key": portalKey},
                cache: "no-store",
            });
            const result = await response.text();
            if (!response.ok) {
                console.error("Collection statistics failed", collectionId, response.status, result);
                return;
            }
            console.log("Collection statistics completed", collectionId, result);
        } catch (error) {
            console.error("Collection statistics failed", collectionId, error);
        }
    });
}
