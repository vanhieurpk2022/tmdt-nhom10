import type { FactoryRegisterResponse } from "../../dto/factory/FactoryRegister"
import type { FactoryStatus } from "../../enums/FactoryStatus";
import api, { type ApiResponse } from "../api"

export const AdminService = {
    getFactoryRegis: async () => {
        const res = await api.get<ApiResponse<FactoryRegisterResponse[]>>(
            `/admin/register-factory`
        );
        return res.data;
    },
    updateStatusFactory: async (id: Number, factoryStatus: FactoryStatus) => {
        const res = await api.patch(
            `/admin/update-role`, { id, factoryStatus }
        );
        return res.status;
    }
}