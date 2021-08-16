import { BaseProps } from '~ui-kit/components/interface/base-props';
import { observer } from 'mobx-react';
import { Card, Loading } from '~ui-kit';
import { FC } from 'react';
import { useCloudDriveContext } from 'agora-edu-core';

export interface LoadingPptProps extends BaseProps {
  initCourseWareProgress: number;
  initCourseWareLoading: boolean;
}

export const LoadingPptContainer: FC<{}> = observer(() => {
  const { initCourseWareProgress, initCourseWareLoading } =
    useCloudDriveContext();
  return initCourseWareLoading ? (
    <PageLoading loadingProcess={initCourseWareProgress} />
  ) : null;
});

const PageLoading = (props: any) => {
  return (
    <div className="page-loading ppd-loading">
      <Card width={258} height={113}>
        <Loading
          hasLoadingGif={false}
          currentProgress={props.loadingProcess}
          loadingText="课件加载中，请稍候…"
          hasProgress></Loading>
      </Card>
    </div>
  );
};
