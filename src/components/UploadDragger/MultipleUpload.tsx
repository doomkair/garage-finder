import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, UploadFile, UploadProps } from 'antd';
import { isString } from 'lodash-es';
import { useState } from 'react';

import { useUploadFileApi } from '@/api';

type MultipleUploadProps = Omit<
  UploadProps,
  'multiple' | 'onChange' | 'fileList'
> & {
  value?: string[];
  onChange?: (value: string[]) => void;
  folder?: string;
};

export function MultipleUpload({
  folder = 'hehehe',
  value,
  onChange,
  ...rest
}: MultipleUploadProps) {
  const { uploadFile } = useUploadFileApi();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const outerFileList: UploadFile[] | undefined = value?.map((url) => ({
    url,
    name: url,
    uid: url,
  }));

  const computedFileList = outerFileList ?? fileList;

  return (
    <Upload
      customRequest={async ({ file, onSuccess, onError }) => {
        if (isString(file)) {
          onError?.({ cause: 'file is string' } as Error);

          return;
        }

        try {
          setFileList((prev) => [
            ...prev,
            { name: file.name, uid: file.name, status: 'uploading' },
          ]);

          const { fileUrl } = await uploadFile(folder, file, file.name);

          setFileList((prev) => {
            const list = [...prev];

            const found = list?.find((item) => item.name === file.name);

            if (found) {
              found.status = 'success';
              found.url = fileUrl;
            }

            return list;
          });

          onChange?.([
            ...computedFileList.map((item) => item.url || ''),
            fileUrl,
          ]);

          onSuccess?.({});
        } catch (error) {
          setFileList((prev) => {
            const list = [...prev];

            const found = list?.find((item) => item.name === file.name);

            if (found) {
              found.status = 'error';
            }

            return list;
          });

          onError?.(error as Error);
        }
      }}
      multiple
      {...rest}
      fileList={fileList}
    >
      <Button icon={<UploadOutlined />} type="primary">
        Upload
      </Button>
    </Upload>
  );
}
