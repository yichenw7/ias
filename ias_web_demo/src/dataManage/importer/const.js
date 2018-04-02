// NOT_SELECT 字段用来控制状态搜索
export const taskStatus = {
    PADDING: { value: 0, displayName: '准备提交', tag: 'padding' },
    UPLOADING: { value: 1, displayName: '提交中...', tag: 'uploading', NOT_SELECT: true },
    UPLOAD_SUCCEED: { value: 2, displayName: '导入中...', tag: 'upload_succeed', NOT_SELECT: true },
    UPLOAD_FAILED: { value: -2, displayName: '导入失败', tag: 'upload_failed', NOT_SELECT: true },
    ADDTASK_SUCCEED: { value: 3, displayName: '添加导入任务成功', tag: 'addtask_succeed', NOT_SELECT: true },
    ADDTASK_FAILED: { value: -3, displayName: '添加导入任务异常', tag: 'addtask_failed', NOT_SELECT: true },
    WAITING: { value: 4, displayName: '准备导入', tag: 'waiting' },
    IMPORT_SUCCEED: { value: 5, displayName: '导入成功', tag: 'import_succeed' },
    IMPORT_FAILED: { value: -5, displayName: '导入异常', tag: 'import_failed' },
    WARN: { value: -6, displayName: '识别异常', tag: 'warn' },
};
