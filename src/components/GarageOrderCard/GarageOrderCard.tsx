import { PhoneFilled } from '@ant-design/icons';
import {
  Button,
  Descriptions,
  Form,
  Image,
  Input,
  Modal,
  Rate,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import { capitalize } from 'lodash-es';
import NextImage from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import {
  GetOrderGarageData,
  useAddFeedback,
  useCancelOrderByUser,
  useGetGarageByIdApi,
  useGetOneFeedback,
} from '@/api';
import { PinMapFilledIcon } from '@/icons';
import { getGarageDetailAddress } from '@/services';
import { twcx } from '@/utils';

type GarageOrderCardProps = {
  id: number;
  garageId: number;
  name: string;
  address: string;
  phone: string;
  carBrand: string;
  carType: string;
  carLicensePlates: string;
  category: string[];
  time: string;
  status: string;
  onMutated?: () => void;

  orderDetail?: GetOrderGarageData[number];
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'green';

    case 'open':
      return 'orange';

    case 'reject':
      return 'red';

    case 'cancelled':
      return 'gray';

    case 'done':
      return 'cyan';

    default:
      return;
  }
};

const translateStatus = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'Đã xác nhận';

    case 'open':
      return 'Đợi xác nhận';

    case 'reject':
      return 'Bị từ chối';

    case 'canceled':
      return 'Bị hủy';

    case 'done':
      return 'Hoàn thành';

    default:
      return '';
  }
};

function ModalContent({
  brand,
  name,
  phoneNumber,
  typeCar,
  licensePlates,
  color,
  content,
  fileOrders,
  imageOrders,
}: GetOrderGarageData[number]) {
  return (
    <>
      <Descriptions layout="vertical">
        <Descriptions.Item label="Tên khách hàng" span={2}>
          {name}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {phoneNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Hãng xe">{brand}</Descriptions.Item>
        <Descriptions.Item label="Dòng xe">{typeCar}</Descriptions.Item>
        <Descriptions.Item label="Biển số">{licensePlates}</Descriptions.Item>
        <Descriptions.Item label="Màu sắc">{color}</Descriptions.Item>
        <Descriptions.Item label="Ngày hoàn thành" span={2}>
          {dayjs().format('DD/MM/YYYY')}
        </Descriptions.Item>

        <Descriptions.Item label="Chi tiết sửa chữa" span={3}>
          {content}
        </Descriptions.Item>

        <Descriptions.Item label="Tệp đính kèm" span={3}>
          <div className="flex flex-col gap-1">
            {fileOrders.map((item) => (
              <Link
                href={item}
                target="_blank"
                key={item}
                className="line-clamp-1"
              >
                {item}
              </Link>
            ))}
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Hình ảnh" span={3}>
          <div className="grid grid-cols-3 gap-2">
            <Image.PreviewGroup>
              {imageOrders.map((url) => (
                <Image src={url} key={url} alt="hehe" />
              ))}
            </Image.PreviewGroup>
          </div>
        </Descriptions.Item>
      </Descriptions>
    </>
  );
}

function FeedbackModal(props: {
  gfOrderID: number;
  onFinish?: () => void;
  content?: string;
  star?: number;
}) {
  const { gfOrderID, onFinish, content, star } = props;

  const { mutateAsync, isLoading } = useAddFeedback();

  return (
    <Form
      onFinish={async (values) => {
        await mutateAsync({ body: { ...values, gfOrderID } });
        onFinish?.();
      }}
      initialValues={{
        content,
        star,
      }}
    >
      <Form.Item name="star" className="text-center">
        <Rate />
      </Form.Item>

      <Form.Item name="content">
        <Input.TextArea placeholder="Vui lòng để lại nhận xét của bạn" />
      </Form.Item>

      <div className="text-center">
        <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          disabled={isLoading}
        >
          Gửi đánh giá
        </Button>
      </div>
    </Form>
  );
}

export default function GarageOrderCard({
  id,
  garageId,
  carBrand,
  carType,
  carLicensePlates,
  category,
  time,
  status,
  onMutated,
  orderDetail,
}: GarageOrderCardProps) {
  const { mutateAsync: cancelOrder, isLoading } = useCancelOrderByUser({
    onSuccess: onMutated,
  });

  const orderId = Number(orderDetail?.gfOrderID);

  const { data: garageInfo } = useGetGarageByIdApi({}, { id: garageId });
  const { data: feedback, refetch } = useGetOneFeedback({
    queryKey: orderId.toString(),
    id: orderId,
    enabled: !isNaN(orderId),
  });

  const [open, setOpen] = useState(false);
  const [openFeedback, setOpenFeedback] = useState(false);

  return (
    <>
      <div className="grid grid-cols-5 grid-rows-1 gap-4 mb-8">
        <div className="col-span-2 rounded-lg bg-gray-200 p-6 relative overflow-hidden">
          <NextImage
            src={garageInfo?.thumbnail || ''}
            alt={garageInfo?.garageName || ''}
            fill
          />
        </div>
        <div className="col-span-3 pb-4 flex flex-col">
          <div className="flex gap-3">
            <h3 className="text-xl font-bold mb-2 mt-0 grow">
              {garageInfo?.garageName}
            </h3>
            <div className="shrink-0">
              <Tag color={getStatusColor(status)} className="rounded-full">
                {translateStatus(status)}
              </Tag>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <PinMapFilledIcon className="text-rose-600" />
            <span>
              {garageInfo?.addressDetail &&
                getGarageDetailAddress(garageInfo.addressDetail)}
            </span>
          </div>

          <div className="flex gap-2 items-center">
            <PhoneFilled className="text-rose-600" />
            <span>{garageInfo?.phoneNumber}</span>
          </div>

          <div className="mt-6 flex gap-2">
            <div className="font-bold">Xe: </div>
            <div>
              {carBrand} - {carType} - {carLicensePlates}
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <div className="font-bold">Loại dịch vụ: </div>
            <div>{category.join(', ')}</div>
          </div>

          <div className="flex gap-2 mt-2">
            <div className="font-bold">Thời gian: </div>
            <div>{dayjs(time).format('DD/MM/YYYY, hh:mm A')}</div>
          </div>

          <div>
            <Button
              className={twcx('mt-10 bg-red-500 hover:bg-red-500/70', {
                invisible: status !== 'open' && status !== 'confirmed',
              })}
              type="primary"
              disabled={isLoading}
              loading={isLoading}
              onClick={() => cancelOrder({ id })}
            >
              Hủy đặt
            </Button>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="primary"
              className={twcx('mt-10 ', {
                hidden: status !== 'done',
              })}
              onClick={() => setOpen(true)}
            >
              Chi tiết
            </Button>

            <Button
              type="primary"
              className={twcx('mt-10 bg-green-500 hover:bg-green-500/60', {
                hidden: status !== 'done',
              })}
              onClick={() => setOpenFeedback(true)}
            >
              {feedback && 'Xem lại'} Đánh giá
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
        width={800}
      >
        <ModalContent {...(orderDetail as any)} />
      </Modal>

      <Modal
        open={openFeedback}
        footer={null}
        onCancel={() => {setOpenFeedback(false);
        refetch();
        }}
        title="Đánh giá dịch vụ"
      >
        <FeedbackModal
          gfOrderID={id}
          onFinish={() => {setOpenFeedback(false)
          refetch();
          }}
          {...(feedback as any)}
        />
      </Modal>
    </>
  );
}
