import { OptionsTrading } from '@/components/OptionsTrading';

const OptionsPage = () => {
  console.log('OptionsPage component is rendering');
  return (
    <div className="space-y-6">
      <h1>Options Trading Page</h1>
      <OptionsTrading />
    </div>
  );
};

export default OptionsPage;