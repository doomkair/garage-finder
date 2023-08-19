import { Layout, Skeleton } from 'antd';

import { useGetFavoriteGarageApi } from '@/api';
import { GarageCard, UserDashboardSider } from '@/components';

const { Content, Sider } = Layout;

export default function MyFavoritePage() {
  const { data: garages, isLoading } = useGetFavoriteGarageApi();

  return (
    <Layout hasSider className="bg-transparent mt-20">
      <Sider className="text-center bg-transparent">
        <UserDashboardSider />
      </Sider>
      <Content className="flex flex-col pr-6 pl-10">
        <Skeleton active loading={isLoading}>
          <div className="grow grid grid-cols-3 gap-x-6 gap-y-8">
            {garages?.map?.((garage) => (
              <GarageCard
                key={garage.garageID}
                id={garage.garageID}
                image={garage.thumbnail}
                title={garage.garageName}
                address={garage.addressDetail}
                totalRate={318}
                rating={4.8}
                isFavorite
              />
            ))}
          </div>
        </Skeleton>
      </Content>
    </Layout>
  );
}
