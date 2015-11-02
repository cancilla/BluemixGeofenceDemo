package com.ibm.cloudoe.samples;

import javax.ws.rs.GET;
import javax.ws.rs.Path;


@Path("/hello")
public class HelloResource {

	@GET
	public String getInformation() {
		return "It works!"; 
	}
}