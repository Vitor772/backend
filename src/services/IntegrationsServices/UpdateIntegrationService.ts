import AppError from "../../errors/AppError";
import Integrations from "../../models/Integrations";

interface Request {
    integration: string | any;
    companyId: number | any;
    value: string | any;
}

const UpdateIntegrationsService = async ({
    integration,
    companyId,
    value
}: Request): Promise<Integrations | undefined> => {
    if (!integration || !companyId) {
        throw new AppError("ERR_INVALID_PARAMETERS", 400);
    }

    const integrations = await Integrations.findOne({
        where: { name: integration, companyId: companyId }
    });

    if (!integrations) {
        throw new AppError("ERR_NO_INTEGRATIONS_FOUND", 404);
    }

    await integrations.update({ token: value });

    return integrations;
};

export default UpdateIntegrationsService;
