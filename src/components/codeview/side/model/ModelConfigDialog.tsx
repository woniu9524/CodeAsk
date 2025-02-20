import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModelStore, ModelConfig } from "@/store/useModelStore";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { toast } from "sonner";

// 定义模型配置表单数据类型，排除 'id' 和 'enabled' 字段
type ModelFormData = Omit<ModelConfig, 'id' | 'enabled'>;

// 组件属性接口
interface ModelConfigDialogProps {
  children: React.ReactNode; // 对话框触发器的子组件
}

export function ModelConfigDialog({ children }: ModelConfigDialogProps) {
  // 使用 react-hook-form 创建表单，设置默认值
  const { register, handleSubmit, reset } = useForm<ModelFormData>({
    defaultValues: {
      baseUrl: "http://localhost:11434/v1", // 默认基础 URL
      temperature: 0.6, // 默认温度参数
      maxContextTokens: 60000, // 默认最大上下文 Token 数
      maxOutputTokens: 8000, // 默认最大输出 Token 数
      concurrency: 1 // 默认并发数
    }
  });

  // 使用模型存储 hook
  const { addModel } = useModelStore();
  
  // 使用国际化 hook
  const { t } = useTranslation();

  // 表单提交处理函数
  const onSubmit = (data: ModelFormData) => {
    // 添加模型到存储，并设置为启用状态
    addModel({ ...data, enabled: true });
    // 重置表单
    reset();
  };

  // 添加测试函数
  const handleTest = async (formData: ModelFormData) => {
    try {
      const chat = new ChatOpenAI({
        openAIApiKey: formData.apiKey,
        modelName: formData.name,
        temperature: formData.temperature,
        maxTokens: formData.maxOutputTokens,
        maxConcurrency: formData.concurrency,
        configuration: {
          baseURL: formData.baseUrl,
        },
      });

      const response = await chat.invoke([
        new HumanMessage("回复Let's go!，不要说其他内容"),
      ]);

      toast.success(t('codeview.model.testSuccess', { content: response.content }));
    } catch (error: any) {
      toast.error(t('codeview.model.testFailed', { error: error.message }));
    }
  };

  return (
    // 对话框组件
    <Dialog>
      {/* 对话框触发器 */}
      <DialogTrigger asChild>{children}</DialogTrigger>
      
      {/* 对话框内容 */}
      <DialogContent className="sm:max-w-[425px]">
        {/* 对话框头部 */}
        <DialogHeader>
          <DialogTitle>{t('codeview.model.add')}</DialogTitle>
        </DialogHeader>
        
        {/* 模型配置表单 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 模型名称输入 */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('codeview.model.name')}</Label>
            <Input 
              id="name" 
              placeholder={t('codeview.model.name')} 
              {...register("name", { required: true })} 
            />
          </div>

          {/* API 密钥输入 */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">{t('codeview.model.apiKey')}</Label>
            <Input 
              id="apiKey" 
              type="password" 
              placeholder={t('codeview.model.apiKey')} 
              {...register("apiKey", { required: true })} 
            />
          </div>

          {/* 基础 URL 输入 */}
          <div className="space-y-2">
            <Label htmlFor="baseUrl">{t('codeview.model.baseUrl')}</Label>
            <Input 
              id="baseUrl" 
              {...register("baseUrl", { required: true })} 
            />
          </div>

          {/* 温度参数输入 */}
          <div className="space-y-2">
            <Label htmlFor="temperature">{t('codeview.model.temperature')}</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              {...register("temperature", {
                required: true,
                valueAsNumber: true, // 将输入转换为数字
              })}
            />
          </div>

          {/* 最大上下文 Token 数输入 */}
          <div className="space-y-2">
            <Label htmlFor="maxContextTokens">{t('codeview.model.maxContextTokens')}</Label>
            <Input
              id="maxContextTokens"
              type="number"
              {...register("maxContextTokens", {
                required: true,
                valueAsNumber: true,
              })}
            />
          </div>

          {/* 最大输出 Token 数输入 */}
          <div className="space-y-2">
            <Label htmlFor="maxOutputTokens">{t('codeview.model.maxOutputTokens')}</Label>
            <Input
              id="maxOutputTokens"
              type="number"
              {...register("maxOutputTokens", {
                required: true,
                valueAsNumber: true,
              })}
            />
          </div>

          {/* 并发数输入 */}
          <div className="space-y-2">
            <Label htmlFor="concurrency">{t('codeview.model.concurrency')}</Label>
            <Input
              id="concurrency"
              type="number"
              min="1"
              {...register("concurrency", {
                required: true,
                valueAsNumber: true,
                min: 1, // 最小值为 1
              })}
            />
          </div>

          {/* 按钮组 */}
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => handleSubmit(handleTest)()}
              className="flex-1"
            >
              {t('codeview.model.test')}
            </Button>
            <Button type="submit" className="flex-1">{t('codeview.model.save')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 