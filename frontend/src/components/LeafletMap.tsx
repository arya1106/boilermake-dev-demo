import { MapContainer, TileLayer, Popup, MapContainerProps, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import "leaflet-defaulticon-compatibility";
import { LatLng, Map, Marker, marker } from 'leaflet';
import React, { Dispatch, RefAttributes, SetStateAction, useRef } from 'react';
import { useMapEvent } from 'react-leaflet';
import axios from 'axios';

const LeafletMap = (props: JSX.IntrinsicAttributes & MapContainerProps & RefAttributes<Map> & {locationTextFieldId?: string, coordsTextFieldId?: string}) => {

    return (
        <MapContainer {...props} zoom={16} zoomSnap={0.7} style={{ width: "40vmax", height: "40vmin" }}>
            <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'/>
            <ClickMarker locationTextFieldId={props.locationTextFieldId} coordsTextFieldId={props.coordsTextFieldId}/>
            <FindMe locationTextFieldId={props.locationTextFieldId} coordsTextFieldId={props.coordsTextFieldId}/>
        </MapContainer>
    );
}

const ClickMarker = ({locationTextFieldId, coordsTextFieldId}: {locationTextFieldId?: string, coordsTextFieldId?: string}) => {
    let clickedMarker: Marker<any> | null = null;
    const map = useMapEvent("click", async (event)=>{
        map.eachLayer((layer)=>{
            if(layer instanceof Marker){
                layer.remove()
            }
        })
        clickedMarker = marker(event.latlng).addTo(map);
        updateLocationBox(locationTextFieldId ?? "", event.latlng);
        updateCoordsBox(coordsTextFieldId ?? "", event.latlng)
    })
    return <div></div>
}

const FindMe = ({locationTextFieldId, coordsTextFieldId}: {locationTextFieldId?: string, coordsTextFieldId?: string}) => {

    const map = useMap();
    map.locate({setView: true, maxZoom: 16});

    useMapEvent("locationerror", (errorEvent)=>{
        map.eachLayer((layer)=>{
            if(layer instanceof Marker){
                layer.remove()
            }
        })
        console.log(errorEvent.message)
        const defaultCoords = new LatLng(40.4276, -86.9169);
        marker(defaultCoords).addTo(map)
        updateLocationBox(locationTextFieldId ?? "", defaultCoords);
        updateCoordsBox(coordsTextFieldId ?? "", defaultCoords);
    })
    
    useMapEvent("locationfound", (event)=>{
        map.eachLayer((layer)=>{
            if(layer instanceof Marker){
                layer.remove()
            }
        })
        marker(event.latlng).addTo(map)
        updateLocationBox(locationTextFieldId ?? "", event.latlng);
        updateCoordsBox(coordsTextFieldId ?? "", event.latlng)
    })

    return <div></div>
}

async function updateLocationBox(locationTextFieldId: string, coords: LatLng){
    var config = {
        method: 'get',
        url: `https://api.geoapify.com/v1/geocode/reverse?lat=${coords.lat}&lon=${coords.lng}&apiKey=cac0da3764184118a1b51c0e472ef4a2`,
        headers: { }
        };

        const addressData = (await axios(config)).data.features[0].properties;

        const locationTextField = document.getElementById(locationTextFieldId);
        locationTextField?.setAttribute("value", `${addressData.address_line1} ${addressData.address_line2}`)
}

function updateCoordsBox(coordsTextFieldId: string, coords: LatLng){
    const coordsTextField = document.getElementById(coordsTextFieldId);
    coordsTextField?.setAttribute("value", `${coords.lat},${coords.lng}`)
}

const CenterMarker = ()=>{}

export default LeafletMap