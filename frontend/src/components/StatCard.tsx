import { Users, Package, FileText, MessageSquare } from "lucide-react";

type StatCardProps = {
  icon: "users" | "package" | "file-text" | "message-square";
  label: string;
  value: string;
};

const icons = {
  users: <Users className="text-blue-500" size={24} />,
  package: <Package className="text-green-500" size={24} />,
  "file-text": <FileText className="text-blue-400" size={24} />,
  "message-square": <MessageSquare className="text-pink-500" size={24} />,
};

const StatCard = ({ icon, label, value }: StatCardProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-2 items-center bg-white px-2 lg:px-4 py-4 lg:py-8 rounded-xl shadow-sm mt-2 md:mt-10">
      <div className="bg-blue-50 p-3 rounded-lg mr-4">{icons[icon]}</div>
      <div className="text-center lg:text-start">
        <p className="text-sm text-gray-500">{label}</p>
        <h3 className="text-xl font-semibold">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
