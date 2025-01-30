import { Assets } from "./Asset";

// First, let's update the AssetResponse interface to match the API response
export interface AssetResponse {
    items: Assets[];
    totalItems: number;
    pageNumber: number;
    pageSize: number;
}