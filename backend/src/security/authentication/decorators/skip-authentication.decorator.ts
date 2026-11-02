import { SetMetadata } from "@nestjs/common";

export const PUBLIC_ROUTE_KEY = "public_route";

export const SkipAuthentication = () => SetMetadata(PUBLIC_ROUTE_KEY, true);
