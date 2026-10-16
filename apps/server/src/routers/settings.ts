import { zSettings } from "@livrelibre/shared/settings";
import { getSettings, updateSettings } from "@server/server/settings";
import { logger } from "@server/utils/logger";

import { adminProcedure, authProcedure } from "../procedures";

export const settingsRoutes = {
  settings: authProcedure.query(getSettings),
  updateSettings: adminProcedure.input(zSettings).mutation(async ({ ctx, input }) => {
    logger.info("Update settings", { user: ctx.user, ...input });
    return await updateSettings(input);
  }),
};
