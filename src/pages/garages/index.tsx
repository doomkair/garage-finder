import styled from '@emotion/styled';
import {
  Button,
  Empty,
  Form,
  Input,
  Pagination,
  Skeleton,
  Typography,
} from 'antd';
import { has, isEmpty } from 'lodash-es';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import {
  useGetCarCompaniesApi,
  useGetGaragesApi,
  useGetServicesApi,
} from '@/api';
import { CheckboxGroup, GarageCard } from '@/components';
import { VIETNAM_PROVINCES } from '@/constants';
import { usePagination } from '@/hooks';

type GarageFilterFormProps = {
  places: number[];
  services: number[];
  brands: number[];
};

const ContentWrapper = styled.div`
  .tl-spin-nested-loading {
    width: 100%;
  }

  .tl-checkbox-wrapper {
    align-items: center;
  }
`;

export default function GaragesPage() {
  const { query, push } = useRouter();

  const [form] = Form.useForm<GarageFilterFormProps>();

  const places = Form.useWatch(['places'], form);
  const services = Form.useWatch(['services'], form);
  const brands = Form.useWatch(['brands'], form);

  const [keyword, setKeyword] = useState('');
  const pagination = usePagination({ currentPage: 1, pageSize: 9 });

  const { data, isLoading: fetchingGarages } = useGetGaragesApi({
    variables: {
      body: {
        keyword,
        provinceID: isEmpty(places) ? undefined : places,
        brandsID: isEmpty(brands) ? undefined : brands,
        categoriesID: isEmpty(services) ? undefined : services,
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
      },
    },
  });

  const { garages, total } = data ?? {};

  const { data: servicesResponseData, isLoading: fetchingServices } =
    useGetServicesApi();

  const { data: carBrands, isLoading: fetchingCarBrands } =
    useGetCarCompaniesApi();

  const provineOptions = VIETNAM_PROVINCES.map((provine) => ({
    label: provine.name,
    value: provine.code,
  }));

  const servicesOptions = servicesResponseData?.map((service) => ({
    label: service.categoryName,
    value: service.categoryID,
  }));

  const carBrandsOptions = carBrands?.map((brand) => ({
    label: (
      <div className="flex gap-2 items-center">
        <div className="relative w-10 h-10">
          {brand.imageLink.startsWith('http') && (
            <Image
              src={brand.imageLink}
              alt=""
              fill
              className="object-contain"
            />
          )}
        </div>
        <span>{brand.brandName}</span>
      </div>
    ),
    value: brand.brandID,
  }));

  useEffect(() => {
    form.setFieldsValue({
      places: query?.provineID
        ? (query?.provineID as string).split(',').map(Number)
        : undefined,
      services: query?.categoriesID
        ? (query?.categoriesID as string).split(',').map(Number)
        : undefined,
    });

    setKeyword(query?.keyword?.toString() || '');
  }, [form, query?.categoriesID, query?.keyword, query?.provineID]);

  return (
    <>
      <ContentWrapper className="w-2/5 flex gap-2 mx-auto">
        <Input
          placeholder="Tìm kiếm ở đây ..."
          value={keyword}
          onChange={(e) => setKeyword(e.currentTarget.value)}
        />
        <Button type="primary" className="min-w-[100px]">
          Tìm
        </Button>
      </ContentWrapper>

      <div className="flex gap-6 my-5">
        <div className="w-1/4 bg-white">
          <Form
            form={form}
            onValuesChange={(changesValue) => {
              if (has(changesValue, 'places')) {
                push({}, undefined, { shallow: true });
              }
            }}
          >
            <Typography className="uppercase text-xs tracking-wider text-gray-500 font-semibold">
              Địa điểm{' '}
              <span className="text-red-600">({places?.length ?? 0})</span>
            </Typography>
            <Form.Item name="places">
              <CheckboxGroup options={provineOptions} />
            </Form.Item>

            <Typography className="uppercase text-xs tracking-wider text-gray-500 font-semibold mb-3">
              Loại dịch vụ{' '}
              <span className="text-red-600">({services?.length ?? 0})</span>
            </Typography>
            <Skeleton active loading={fetchingServices}>
              <Form.Item name="services">
                <CheckboxGroup showSearch={false} options={servicesOptions} />
              </Form.Item>
            </Skeleton>

            <Typography className="uppercase text-xs tracking-wider text-gray-500 font-semibold mb-3">
              Hãng xe{' '}
              <span className="text-red-600">({brands?.length ?? 0})</span>
            </Typography>
            <Skeleton active loading={fetchingCarBrands}>
              <Form.Item name="brands">
                <CheckboxGroup
                  showSearch={false}
                  options={carBrandsOptions as any}
                />
              </Form.Item>
            </Skeleton>
          </Form>
        </div>

        <div className="flex flex-col grow">
          <Skeleton active loading={fetchingGarages}>
            <div className="grid grid-cols-3 gap-x-6 gap-y-8">
              {garages?.map?.((garage) => (
                <GarageCard
                  key={garage.garageID}
                  id={garage.garageID}
                  image={garage.thumbnail}
                  title={garage.garageName}
                  address={garage.addressDetail}
                  totalRate={garage.feedbacksNumber}
                  rating={garage.star}
                />
              ))}

              {isEmpty(garages) && <Empty className="col-span-3" />}
            </div>

            <Pagination
              className="mt-10 text-center"
              pageSize={9}
              total={total}
              current={pagination.currentPage}
              onChange={(pageNumber) => pagination.goPage(pageNumber)}
            />
          </Skeleton>
        </div>
      </div>
    </>
  );
}
