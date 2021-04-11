import { SpaceConnector } from '@/lib/space-connector';
import { ResourceMap } from '@/store/modules/resource/type';

export const load = async ({ state, commit }, lazyLoad = false): Promise<void|Error> => {
    if (lazyLoad && Object.keys(state.items).length > 0) return;
    try {
        const response = await SpaceConnector.client.inventory.cloudServiceType.list({
            query: {
                only: ['cloud_service_type_id', 'name', 'group', 'provider', 'tags'],
            },
        });
        const cloudServiceTypes: ResourceMap = {};

        response.results.forEach((cloudServiceTypeInfo: any): void => {
            cloudServiceTypes[cloudServiceTypeInfo.cloud_service_type_id] = {
                label: `${cloudServiceTypeInfo.group} > ${cloudServiceTypeInfo.name}`,
                name: cloudServiceTypeInfo.name,
                icon: cloudServiceTypeInfo.tags['spaceone:icon'],
            };
        });

        commit('setCloudServiceTypes', cloudServiceTypes);
    } catch (e) {}
};
