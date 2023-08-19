import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { Button, DatePicker, Form, Input, Typography } from 'antd';
import { Dayjs } from 'dayjs';
import { first, last } from 'lodash-es';
import { useRouter } from 'next/router';
import { geocodeByPlaceId } from 'react-google-places-autocomplete';

import { useAddGarageApi } from '@/api';
import {
  CarBrandSelect,
  PlaceAutoCompleted,
  RoundedCascader,
  ServicesSelect,
  SingleUploadDragger,
} from '@/components';
import { LOCATION_CASCADER_OPTIONS } from '@/constants';
import { UserIcon } from '@/icons';
import { emailRule, requiredRule } from '@/services';
import { showError, showSuccess } from '@/utils';

const Wrapper = styled.div`
  #place {
    .css-13cymwt-control {
      border-radius: 9999px !important;
      height: 48px;
      box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,
        rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
    }
  }
`;

type AddGarageFormValues = {
  name: string;
  phone: string;
  email: string;
  services: number[];
  carCompanies: number[];
  address: [number, number];
  detailAddress: string;
  openTime: [Dayjs, Dayjs];
  thumbnail: string;
};

export default function AddGaragePage() {
  const router = useRouter();
  const [form] = Form.useForm<AddGarageFormValues>();

  const { mutate: addGarage, isLoading: adding } = useAddGarageApi({
    onSuccess: () => {
      showSuccess('Đăng ký Garage thành công!');
      router.push('/my-garages');
    },
    onError: showError,
  });

  const onFinish = async () => {
    const values = form.getFieldsValue();
    try {
      const { place_id } = JSON.parse(values?.detailAddress).value;
      const [{ geometry }] = await geocodeByPlaceId(place_id);
      await addGarage({
        body: {
          addressDetail: values.detailAddress,
          brandsID: values.carCompanies,
          categoriesID: values.services,
          openTime: first(values.openTime)?.format('hh:mm A'),
          closeTime: last(values.openTime)?.format('hh:mm A'),
          provinceID: first(values.address),
          districtsID: last(values.address),
          emailAddress: values.email,
          garageName: values.name,
          phoneNumber: values.phone,
          imageLink: [''],
          thumbnail: values.thumbnail,
          latAddress: geometry.location.lat(),
          lngAddress: geometry.location.lng(),
        },
      });
    } catch (error) {
      showError(error);
    }
  };

  return (
    <Wrapper>
      <Typography.Title level={2} className="text-center my-10">
        Đăng ký Garage
      </Typography.Title>

      <Form
        form={form}
        className="grid grid-cols-2 gap-10 mx-auto w-max"
        onFinish={onFinish}
      >
        <div className="col-span-2">
          <Form.Item name="thumbnail" rules={[requiredRule()]}>
            <SingleUploadDragger />
          </Form.Item>
        </div>

        <div>
          <Form.Item className="w-[450px]" name="name" rules={[requiredRule()]}>
            <Input
              size="large"
              placeholder="Tên Garage"
              className="rounded-full shadow-md"
              suffix={<UserIcon className="text-neutral-500" />}
            />
          </Form.Item>

          <Form.Item
            className="w-[450px]"
            name="phone"
            rules={[requiredRule()]}
          >
            <Input
              size="large"
              placeholder="Số điện thoại"
              className="rounded-full shadow-md"
              suffix={<PhoneOutlined className="text-neutral-500" />}
            />
          </Form.Item>

          <Form.Item
            className="w-[450px]"
            name="email"
            rules={[requiredRule(), emailRule()]}
          >
            <Input
              size="large"
              placeholder="Email"
              className="rounded-full shadow-md"
              suffix={<MailOutlined className="text-neutral-500" />}
            />
          </Form.Item>

          <Form.Item
            className="w-[450px]"
            name="openTime"
            rules={[requiredRule()]}
          >
            <DatePicker.RangePicker
              className="w-full rounded-full shadow-md"
              size="large"
              picker="time"
              placeholder={['Giờ mở cửa', 'Giờ đóng cửa']}
              format="hh:mm A"
            />
          </Form.Item>
        </div>

        <div>
          <Form.Item
            className="w-[450px]"
            name="services"
            rules={[requiredRule()]}
          >
            <ServicesSelect rounded />
          </Form.Item>

          <Form.Item name="carCompanies" rules={[requiredRule()]}>
            <CarBrandSelect rounded />
          </Form.Item>

          <Form.Item name="address" rules={[requiredRule()]}>
            <RoundedCascader
              size="large"
              className="rounded-full shadow-md"
              options={LOCATION_CASCADER_OPTIONS}
              placeholder="Địa chỉ"
              showSearch={{
                filter: (inputValue, path) =>
                  path.some(
                    (option) =>
                      (option.label || '')
                        .toString()
                        .toLowerCase()
                        .indexOf(inputValue.toLowerCase()) > -1
                  ),
              }}
            />
          </Form.Item>

          <div id="place">
            <Form.Item name="detailAddress" rules={[requiredRule()]}>
              <PlaceAutoCompleted />
            </Form.Item>
          </div>
        </div>

        <Form.Item className="mx-auto col-span-2">
          <Button
            type="primary"
            className="min-w-[200px] rounded-full shadow-md shadow-primary"
            size="large"
            loading={adding}
            htmlType="submit"
          >
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    </Wrapper>
  );
}
