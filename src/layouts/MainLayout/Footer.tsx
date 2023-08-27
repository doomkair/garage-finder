import { MailOutlined } from '@ant-design/icons';
import { Button, Divider, Input, Typography } from 'antd';

import subscribeBg from '@/assets/images/bg-subscribe.png';
import { twcx } from '@/utils';

type FooterProps = {
  className?: string;
};

export function Footer({ className }: FooterProps) {
  return (
    <footer className={twcx(className, 'pb-10 container mx-auto')}>
      <div
        className="mt-10 flex flex-col items-center rounded-md bg-primary p-16 bg-no-repeat bg-cover"
        style={{ backgroundImage: `url(${subscribeBg.src})` }}
      >
        <Typography.Text className="text-3xl text-white mb-5">
          Đăng ký để nhận tin tức mới nhất và ưu đãi & ưu đãi độc quyền của
          Garage Finder
        </Typography.Text>
        <div className="flex gap-2 max-w-4xl w-1/2 shadow bg-white p-3 rounded-lg">
          <Input
            className="grow text-lg flex gap-3"
            bordered={false}
            prefix={<MailOutlined className="text-slate-500" />}
            placeholder="Viết email của bạn vào đây"
          />
          <Button type="primary">Đăng Ký</Button>
        </div>
      </div>
      <div className="grid grid-cols-5 px-20 mt-10">
        <div className="col-span-2">
          <Typography.Text className="text-2xl uppercase font-bold">
            <span>Garage</span> <span className="text-primary">Finder</span>
          </Typography.Text>
        </div>
        <div className="flex flex-col gap-2 text-gray-600">
          <div className="font-bold mb-6">Garage Finder</div>
          <div>Giới thiệu</div>
          <div>Quy chế hoạt động</div>
          <div>Chính sách bảo mật</div>
        </div>
        <div className="flex flex-col gap-2 text-gray-600">
          <div className="font-bold mb-6">Hỗ trợ</div>
          <div>Trung tâm trợ giúp</div>
          <div>Báo cáo sự cố</div>
          <div>Liên hệ hỗ trợ</div>
        </div>
        <div className="flex flex-col gap-2 text-gray-600">
          <div className="font-bold mb-6">More</div>
          <div>Blog của chúng tôi</div>
        </div>
      </div>

      <Divider />

      <div className="flex justify-between px-20 text-slate-600">
        <span>Bản quyền, Garage Finder 2023. Bảo lưu mọi quyền.</span>
        <span>Điều khoản</span>
      </div>
    </footer>
  );
}
