import { BaseQueryApiOptions, Maybe } from '@/types';

import { useBaseQueryApi } from './useBaseQueryApi';

type GetGaragesData = {
  garages: Array<{
    garageID: number;
    userID: number;
    garageName: string;
    emailAddress: string;
    phoneNumber: string;
    imageGarages: Array<{
      imageID: number;
      garageID: number;
      imageLink: string;
    }>;
    langAddress: number;
    latAddress: number;
    addressDetail: string;
    thumbnail: Maybe<string>;
    feedbacksNumber: number;
    star: number;
  }>;
  total: number;
};

type GetGaragesVariables = {
  body: {
    keyword?: string;
    provinceID?: number[];
    districtsID?: number[];
    categoriesID?: number[];
    brandsID?: number[];
    pageNumber: number;
    pageSize: number;
  };
};

export function useGetGaragesApi(
  options?: BaseQueryApiOptions<GetGaragesData, GetGaragesVariables>
) {
  return useBaseQueryApi({
    method: 'POST',
    queryKey: 'garages',
    endpoint: '/api/Garage/GetByKeyWord',
    ...options,
  });
}
