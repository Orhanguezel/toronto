'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import styled from 'styled-components';
import { Button } from '@/shared/ui/buttons/Button';
import { toast } from 'sonner';

const Wrap = styled.form`
  display: grid;
  gap: 12px;
  width: min(100%, 560px);
  margin-inline: auto; /* yatay ortala */
`;
const Field = styled.label`
  display: grid;
  gap: 6px;
`;
const Input = styled.input`
  padding: 10px 12px;
  border-radius: 10px;
  border: var(--input-border);
  background: var(--input-bg, var(--color-surface));
  color: var(--color-text);
  &::placeholder { color: var(--input-placeholder); }
  outline: none;
`;
const TextArea = styled.textarea`
  padding: 10px 12px;
  min-height: 140px;
  resize: vertical;
  border-radius: 10px;
  border: var(--input-border);
  background: var(--input-bg, var(--color-surface));
  color: var(--color-text);
  &::placeholder { color: var(--input-placeholder); }
  outline: none;
`;
const Hint = styled.small`
  color: var(--color-textSecondary);
`;

const Schema = z.object({
  name: z.string().min(2, 'Ad çok kısa'),
  email: z.string().email('Geçerli bir e-posta girin'),
  message: z.string().min(10, 'Mesaj çok kısa'),
  website: z.string().max(0).optional(), // honeypot
});
type FormData = z.infer<typeof Schema>;

export default function ContactForm({ locale }: { locale: string }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<FormData>({ resolver: zodResolver(Schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-locale': locale },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Gönderilemedi');
      toast.success('Mesajınız alındı. Teşekkürler!');
      reset();
    } catch (e: any) {
      toast.error(e.message || 'Bir hata oluştu');
    }
  };

  return (
    <Wrap onSubmit={handleSubmit(onSubmit)}>
      <Field>
        <span>Ad Soyad</span>
        <Input {...register('name')} placeholder="Adınız" />
        {errors.name && <Hint>{errors.name.message}</Hint>}
      </Field>
      <Field>
        <span>E-posta</span>
        <Input {...register('email')} placeholder="e-posta@ornek.com" />
        {errors.email && <Hint>{errors.email.message}</Hint>}
      </Field>
      <Field>
        <span>Mesaj</span>
        <TextArea {...register('message')} placeholder="Mesajınız" />
        {errors.message && <Hint>{errors.message.message}</Hint>}
      </Field>

      {/* honeypot */}
      <input type="text" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} {...register('website')} />

      <Button type="submit" disabled={isSubmitting}>Gönder</Button>
      <Hint>Spam koruması aktif. Gerekirse reCAPTCHA eklenecek.</Hint>
    </Wrap>
  );
}
