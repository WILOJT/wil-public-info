"use client"
import FullCalendarComponent from "./Components/FullCalendar";
import OtherHousesIcon from '@mui/icons-material/OtherHouses';
import CallEndIcon from '@mui/icons-material/CallEnd';
import FacebookIcon from '@mui/icons-material/Facebook';
import LanguageIcon from '@mui/icons-material/Language';
import { Tooltip, Typography } from "@mui/material";
import catplying from '../../public/cat_playing.gif'
import willogo from '../../public/wil_logo.png'
import Image from "next/image";

export default function Home() {
    return (
      <div className="flex flex-col w-full min-h-screen justify-center items-center ">
        <div className="flex flex-col bg-amber-400 w-full p-6 relative">
          <Image src={willogo.src} alt="logo" width={150} height={150} />
        </div>
        <div className="w-screen overflow-auto md:w-1/2 lg:w-1/2 xl:w-1/2 flex justify-center items-center flex-grow">
          <FullCalendarComponent />
        </div>
        <div className="w-full relative"><Image src={catplying.src} alt="catplaying" width={150} height={150} className=" left-0 top-0" style={{marginBottom:'-0.65em'}}/></div>
        <div className="w-full m-auto bg-black p-6 flex flex-col md:flex-row lg:flex-row xl:flex-row gap-3 md:gap-24 lg:gap-24 xl:gap-24 justify-center">
            <div className="flex gap-3">
              <Tooltip title='Inhouse'><span className="rounded-full p-1"><OtherHousesIcon sx={{color:'white'}} fontSize="medium"/></span></Tooltip>
              <div className="flex flex-col">
                <Typography variant="caption" color="silver">Inhouse</Typography>
                <Typography variant="subtitle1" fontWeight={"bold"} className="text-amber-400">188</Typography>
              </div>
            </div>
            <div className="flex gap-3">
              <Tooltip title='Inhouse'><span className="rounded-full p-1"><CallEndIcon sx={{color:'white'}} fontSize="medium"/></span></Tooltip>
              <div className="flex flex-col">
                <Typography variant="caption" color="silver">Landline</Typography>
                <Typography variant="subtitle1" fontWeight={"bold"} className="text-amber-400">411-2000-188</Typography>
              </div>
            </div>
            <div className="flex gap-3">
              <Tooltip title='Inhouse'><span className="rounded-full p-1"><FacebookIcon sx={{color:'white'}} fontSize="medium"/></span></Tooltip>
              <div className="flex flex-col">
                <Typography variant="caption" color="silver">Facebook</Typography>
                <a href="https://www.facebook.com/@CITUWildcatInnovLabs/" target="_blank"><Typography variant="subtitle1" fontWeight={"bold"} className="text-amber-400">CIT-U Wildcat Innovation Labs</Typography></a>
              </div>
            </div>
            <div className="flex gap-3 relative">
              <Tooltip title='Inhouse'><span className="rounded-full p-1"><LanguageIcon sx={{color:'white'}} fontSize="medium"/></span></Tooltip>
              <div className="flex flex-col">
                <Typography variant="caption" color="silver">Website</Typography>
                <a href="http://wildcatinnovationlabs.com" target="_blank"><Typography variant="subtitle1" fontWeight={"bold"} className="text-amber-400">wildcatinnovationlabs.com</Typography></a>
              </div>
            </div>
        </div>
      </div>
    );
}
