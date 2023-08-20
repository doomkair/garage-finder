import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Typography } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { StaffLoginData, useStaffLogin } from '@/api';
import staffLogin from '@/assets/images/staff-login.png';
import { useAuthStore } from '@/context/auth.context';
import { requiredRule } from '@/services';
import { showError, showSuccess } from '@/utils';

type SignInFormProps = {
  email: string;
  password: string;
};

export default function StaffLoginPage() {
  const router = useRouter();

  const [, dispatch] = useAuthStore();

  const [form] = Form.useForm<SignInFormProps>();

  const onLoginSuccess = (data: StaffLoginData) => {
    dispatch({
      type: 'SIGN_IN',
      payload: {
        user: {
          accessToken: data.accessToken,
          id: data.userID,
          email: data.emailAddress,
          fullName: data.name,
          phone: data.phoneNumber,
          avatar: data.linkImage,
          role: 'STAFF',
        },
        accessToken: data.accessToken,
        refreshToken: '',
      },
    });

    localStorage.setItem('ROLE', 'STAFF');

    showSuccess('Đăng nhập thành công!');

    router.push(`/my-garages/manage/order?garageId=${data.garageID}`);
  };

  const { mutate: loginWithPassword, isLoading: signingWithPassword } =
    useStaffLogin({
      onSuccess: onLoginSuccess,
      onError: showError,
    });

  return (
    <div className="flex mt-20">
      <div className="relative w-3/5 min-h-[500px]">
        <Image src={staffLogin} alt="" />
      </div>
      <div className="w-2/5 px-5 flex flex-col items-center">
        <Form
          form={form}
          className="max-w-md w-full"
          onFinish={(data) => {
            loginWithPassword({
              body: { email: data.email, password: data.password },
            });
          }}
        >
          <Typography.Title className="mb-14" level={2}>
            Đăng nhập
          </Typography.Title>

          <Form.Item name="email" rules={[requiredRule()]}>
            <Input
              size="large"
              className="rounded-full shadow-md"
              placeholder="Email"
              suffix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item name="password" rules={[requiredRule()]}>
            <Input.Password
              size="large"
              className="rounded-full shadow-md"
              placeholder="Mật khẩu"
              suffix={<LockOutlined />}
            />
          </Form.Item>

          <Form.Item className="mt-14">
            <Button
              className="w-full rounded-full shadow-md"
              size="large"
              type="primary"
              htmlType="submit"
              disabled={signingWithPassword}
              loading={signingWithPassword}
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>

        <Link href="/forgot-password">
          <Typography.Text className="hover:text-primary hover:font-bold">
            Quên mật khẩu?
          </Typography.Text>
        </Link>
      </div>
    </div>
  );
}
