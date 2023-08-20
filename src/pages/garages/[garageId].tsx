import {
  CheckOutlined,
  FlagOutlined,
  MessageFilled,
  PhoneFilled,
} from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Rate,
  Result,
  Select,
  Skeleton,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { isEmpty, range, take } from 'lodash-es';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';

import {
  useAddOrder,
  useAddOrderFromGuest,
  useAddOrderWithoutCar,
  useAddReport,
  useGetFeedbackById,
  useGetGarageByIdApi,
  useSendVerifyCode,
} from '@/api';
import { useGetMyCarsApi } from '@/api/useGetMyCarsApi';
import { CarBrandSelect, MultipleUpload, ServiceCard } from '@/components';
import { REGEX_VIETNAM_PHONE } from '@/constants';
import { useAuthStore } from '@/context';
import { ClockIcon, PinMapFilledIcon } from '@/icons';
import {
  emailRule,
  getGarageDetailAddress,
  phoneRule,
  requiredRule,
} from '@/services';
import { showError, showSuccess } from '@/utils';

type RouteParams = {
  garageId: string;
};

function ReportModal(props: { garageId: number; onClose: () => void }) {
  const { garageId, onClose } = props;

  const { mutateAsync: addReport, isLoading } = useAddReport();

  return (
    <Form
      className="mt-10"
      layout="vertical"
      onFinish={async (values) => {
        await addReport({
          body: {
            garageID: garageId,
            ...values,
          },
        });
        showSuccess('Báo cáo thành công !');
        onClose();
      }}
    >
      <Typography className="mb-10 text-lg font-bold text-center">
        Tại sao bạn muốn báo cáo garage này ?
      </Typography>

      <Form.Item label="Lý do" rules={[requiredRule()]} required name="reason">
        <Input.TextArea autoSize={{ minRows: 4 }} />
      </Form.Item>

      <Form.Item name="imageLink">
        <MultipleUpload />
      </Form.Item>

      <div className="flex justify-center mt-20">
        <Button
          disabled={isLoading}
          loading={isLoading}
          className="min-w-[80px]"
          htmlType="submit"
        >
          Gửi
        </Button>
      </div>
    </Form>
  );
}

export default function GarageDetailPage() {
  const [{ user }] = useAuthStore();
  const router = useRouter();
  const { garageId } = router.query as RouteParams;

  const [form] = Form.useForm();
  const phone = Form.useWatch('phone', form);

  const { data: garage, isLoading } = useGetGarageByIdApi(
    { enabled: !isNaN(Number(garageId)) },
    { id: Number(garageId) }
  );

  const { mutate: sendCode, isLoading: sendingCode } = useSendVerifyCode({
    onSuccess: () => {
      showSuccess('Mã xác thực đã được gửi!');
    },
    onError: showError,
  });

  const { mutateAsync: addOrderFromGuest, isLoading: addingOrderGuest } =
    useAddOrderFromGuest();

  const { mutateAsync: addOrder, isLoading: addingOrder } = useAddOrder();

  const { mutateAsync: addOrderWithoutCar, isLoading: addingOrderWithoutCar } =
    useAddOrderWithoutCar();

  const { data: myCars, isLoading: fetchingMyCars } = useGetMyCarsApi({
    enabled: !!user,
  });

  const { data: feebacks, isLoading: fetchingFeedback } = useGetFeedbackById(
    +garageId
  );

  const [openReport, setOpenReport] = useState(false);

  if (!garage && !isLoading)
    return (
      <Result
        status={404}
        title="404"
        subTitle="Xin lỗi! Chúng tôi không tìm thấy trang bạn yêu cầu"
      />
    );

  if (!garage) return <Skeleton active loading={true} />;

  const { openTime, closeTime } = garage;

  const ordering = addingOrderGuest || addingOrder || addingOrderWithoutCar;

  const hasLogin = !!user;
  const hasCar = !!myCars?.length;

  const onFinish = async () => {
    const {
      brand,
      date,
      email,
      name,
      phone,
      services,
      verifyCode,
      typeCar,
      licensePlates,
      carId,
    } = form.getFieldsValue();

    try {
      if (hasLogin) {
        if (hasCar) {
          await addOrder({
            body: {
              garageId: Number(garageId),
              phoneNumber: phone,
              verificationCode: verifyCode,
              categoryGarageId: services,
              carId,
              timeAppointment: dayjs(date).format('DD/MM/YYYY hh:mm A'),
            },
          });
        } else {
          await addOrderWithoutCar({
            body: {
              garageId: Number(garageId),
              name: user.fullName,
              // email: user.email,
              phoneNumber: phone,
              verificationCode: verifyCode,
              brandCarID: brand,
              typeCar,
              licensePlates,
              categoryGargeId: services,
              timeAppointment: dayjs(date).format('DD/MM/YYYY hh:mm A'),
            },
          });
        }
      } else {
        await addOrderFromGuest({
          body: {
            garageId: Number(garageId),
            name,
            email,
            phoneNumber: phone,
            verificationCode: verifyCode,
            brandCarID: brand,
            typeCar,
            licensePlates,
            categoryGargeId: services,
            timeAppointment: dayjs(date).format('DD/MM/YYYY hh:mm A'),
            // timeAppointment: dayjs(date).toISOString(),
          },
        });
      }

      showSuccess('Tạo yêu cầu thành công');
      //form.setFieldsValue({});
      form.resetFields();
    } catch (error) {
      showError(error);
    }
  };

  const validImages = garage?.imageGarages.filter(
    (item) => !isEmpty(item.imageLink)
  );

  return (
    <Skeleton active loading={isLoading}>
      <Typography.Title level={3}>{garage.garageName}</Typography.Title>
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <PinMapFilledIcon className="text-primary" />
            <span className="text-neutral-600 font-semibold">
              {getGarageDetailAddress(garage.addressDetail)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="text-primary" />
            <span className="text-neutral-600 font-semibold">
              Giờ mở cửa - đóng cửa: {openTime} - {closeTime}
            </span>
          </div>
        </div>
        <div>
          <Button icon={<FlagOutlined />} onClick={() => setOpenReport(true)}>
            Báo cáo
          </Button>
          <Modal
            open={openReport}
            onCancel={() => setOpenReport(false)}
            footer={null}
          >
            <ReportModal
              garageId={+garageId}
              onClose={() => setOpenReport(false)}
            />
          </Modal>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 min-h-[500px]">
        <div className="relative rounded overflow-hidden">
          <Image alt="Main Image" src={garage?.thumbnail || ''} fill />
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-2">
          {take(validImages, 4).map((image) => (
            <div
              className="relative rounded overflow-hidden"
              key={image.imageID}
            >
              <Image alt="sub Image" src={image.imageLink} fill />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex gap-6">
        <div className="w-3/5 pr-3">
          <Typography.Title level={4}>Các dịch vụ cung cấp</Typography.Title>
          <div className="grid grid-cols-2 gap-4">
            {garage.categoryGarages.map((item) => (
              <ServiceCard
                key={item.categoryGarageID}
                id={item.categoryGarageID}
                title={item.categoryName}
                image={(() => {
                  switch (item.categoryName) {
                    case 'Sửa chữa':
                      return '/repair.png';

                    case 'Bảo dưỡng':
                      return '/maintenance.png';

                    case 'Tân trang':
                      return '/refurbished.png';

                    case 'Cứu hộ':
                      return '/rescue.png';

                    default:
                      return '';
                  }
                })()}
              />
            ))}
          </div>

          <Typography.Title level={4}>Hãng xe sửa chữa</Typography.Title>

          <div className="grid grid-cols-3 gap-2">
            {garage.garageBrands.map((item) => (
              <div key={item.brId} className="flex gap-2 items-center">
                <div className="w-14 h-14 relative">
                  <Image
                    src={item.linkImage || ''}
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>

                <span>{item.brandName}</span>
              </div>
            ))}
          </div>

          <Typography.Title level={4}>Bản đồ</Typography.Title>
          <div className="mt-5">
            <iframe
              title="map"
              className="border-none w-full aspect-video"
              src={`//maps.google.com/maps?q=${garage?.latAddress},${garage?.lngAddress}&z=15&output=embed`}
            />
          </div>
        </div>

        <div className="grow">
          <div className="p-6 border border-neutral-400 border-solid rounded-lg w-full box-border flex flex-col items-center gap-4 mt-16">
            <Typography.Title level={3}>Liên hệ</Typography.Title>
            <Button
              type="primary"
              className="w-56"
              onClick={() => router.push(`/manage/chat?garageId=${garageId}`)}
            >
              <MessageFilled />
              <span>Nhắn tin cho Garage</span>
            </Button>

            <Button type="text" className="w-56 text-xl text-neutral-800">
              <PhoneFilled />
              <span>{garage.phoneNumber}</span>
            </Button>
          </div>

          <Skeleton active loading={!!user && fetchingMyCars}>
            <div className="p-6 border border-neutral-400 border-solid rounded-lg w-full box-border flex flex-col gap-4 mt-16">
              <Form form={form} layout="vertical" onFinish={onFinish}>
                {!hasCar && !hasLogin && (
                  <Form.Item
                    label="Họ Tên"
                    name="name"
                    rules={[requiredRule()]}
                  >
                    <Input />
                  </Form.Item>
                )}

                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[requiredRule(), phoneRule()]}
                >
                  <Input />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    disabled={
                      sendingCode || !String(phone).match(REGEX_VIETNAM_PHONE)
                    }
                    loading={sendingCode}
                    onClick={() => sendCode({ body: phone })}
                  >
                    Xác thực SMS
                  </Button>
                </Form.Item>

                <Form.Item
                  label="Mã xác thực"
                  name="verifyCode"
                  rules={[requiredRule()]}
                >
                  <Input />
                </Form.Item>

                {!hasCar && !hasLogin && (
                  <Form.Item
                    label="Email"
                    rules={[requiredRule(), emailRule()]}
                    name="email"
                  >
                    <Input />
                  </Form.Item>
                )}

                {hasCar ? (
                  <Form.Item name="carId" label="Chọn xe của bạn">
                    <Select
                      options={myCars.map((item) => ({
                        label: `${item.licensePlates}`,
                        value: item.carID,
                      }))}
                    />
                  </Form.Item>
                ) : (
                  <>
                    <Form.Item
                      label="Hãng xe"
                      name="brand"
                      rules={[requiredRule()]}
                    >
                      <CarBrandSelect mode={undefined} />
                    </Form.Item>

                    <Form.Item
                      label="Dòng xe"
                      name="typeCar"
                      rules={[requiredRule()]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item
                      label="Biển số xe"
                      name="licensePlates"
                      rules={[requiredRule()]}
                    >
                      <Input />
                    </Form.Item>
                  </>
                )}

                <Form.Item
                  label="Chọn loại dịch vụ"
                  name="services"
                  rules={[requiredRule()]}
                >
                  <Select
                    options={garage.categoryGarages.map((item) => ({
                      label: item.categoryName || '!# error',
                      value: item.categoryGarageID,
                    }))}
                    mode="multiple"
                  />
                </Form.Item>

                <Form.Item
                  label="Chọn thời gian"
                  name="date"
                  rules={[requiredRule()]}
                >
                  <DatePicker
                    showTime
                    className="w-full"
                    disabledDate={(current) =>
                      current.isBefore(dayjs().subtract(1, 'day'))
                    }
                    disabledTime={(date) => {
                      const now = dayjs();
                      const openTime = dayjs(garage.openTime, 'hh:mm A');

                      const start = now.isAfter(openTime) ? now : openTime;
                      const end = dayjs(garage.closeTime, 'hh:mm A');

                      const disabledHours = () => {
                        if (date?.get('D') !== now.get('D')) {
                          return range(24).filter(
                            (hour) =>
                              hour < openTime.get('h') || hour > end.get('h')
                          );
                        }

                        return range(24).filter(
                          (hour) => hour < start.get('h') || hour > end.get('h')
                        );
                      };

                      const disabledMinutes = (hour: number) => {
                        if (hour < end.get('h')) {
                          return range(60).filter(
                            (m) => m < start.get('minute')
                          );
                        }

                        return [];
                      };

                      return {
                        disabledHours,
                        disabledMinutes,
                        // disabledSeconds: () => [55, 56],
                      };
                    }}
                    showSecond={false}
                    format="DD/MM/YYYY hh:mm A"
                  />
                </Form.Item>

                <div className="w-full flex flex-col items-center my-10">
                  <div className="w-4/5 flex gap-1 items-center">
                    <CheckOutlined />
                    <span>Đặt lịch 24/7</span>
                  </div>
                  <div className="w-4/5 flex gap-1 items-center">
                    <CheckOutlined />
                    <span>Không cần thanh toán</span>
                  </div>
                  <div className="w-4/5 flex gap-1 items-center">
                    <CheckOutlined />
                    <span>Đánh giá trung thực</span>
                  </div>
                </div>

                <Form.Item className="text-center">
                  <Button
                    htmlType="submit"
                    type="primary"
                    disabled={ordering}
                    loading={ordering}
                  >
                    Đặt lịch
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Skeleton>
        </div>
      </div>

      <div>
        <Typography.Title level={4}>Đánh giá từ khách hàng</Typography.Title>
        <div className="flex gap-3 items-center">
          <Rate
            value={
              (feebacks ?? []).reduce((acc, cur) => acc + cur.star, 0) /
              (feebacks?.length ?? 1)
            }
          />

          <span>{feebacks?.length || 0} đánh giá</span>
        </div>

        <Skeleton active loading={fetchingFeedback}>
          <div className="mt-10">
            {feebacks?.map((item) => (
              <div key={item.feedbackID} className="mb-12">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 relative rounded-full overflow-hidden bg-gray-200 border-none">
                    <Image
                      src={item.linkImage || ''}
                      alt=""
                      fill
                      className="border-none object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="m-0">{item.name}</h4>
                    <div>
                      <span>
                        {dayjs(item.dateTime).format('DD MMMM, YYYY')}
                      </span>
                      <Rate className="scale-75" value={item.star} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-neutral-800">{item.content}</div>
              </div>
            ))}
          </div>
        </Skeleton>
      </div>
    </Skeleton>
  );
}
