/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.collabpaint.restController;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.CopyOnWriteArrayList;
/**
 *
 * @author Sergio
 */
@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;
    ConcurrentMap<String, CopyOnWriteArrayList<Point>> points= new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
        if(!points.containsKey(numdibujo)){
            CopyOnWriteArrayList<Point> p=new CopyOnWriteArrayList<>();
            p.add(pt);
            points.put(numdibujo,p);
        }else{
            points.get(numdibujo).add(pt);
            if(points.get(numdibujo).size()>=3){
                msgt.convertAndSend("/topic/newpolygon."+numdibujo, points.get(numdibujo));
            }
        }
        System.out.println("Nuevo punto recibido en el servidor!:"+pt);

    }
}
