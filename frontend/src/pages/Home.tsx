import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

const HomePage = () => {

    const routes = [
        { name: 'Register', path: '/register' },
    ]

  return (
    <div className="w-full h-full ">
        <div className="p-8 flex flex-col items-center gap-4">
            {routes.map((route) => (
                <Link key={route.path} to={route.path}>
                    <Button text-sm variant="outline">
                        {route.name}
                    </Button>
                </Link>
            ))}
        </div>
    </div>
  )
}

export default HomePage