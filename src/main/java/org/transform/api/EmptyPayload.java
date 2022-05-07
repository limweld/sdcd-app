package org.transform.api;

import java.util.ArrayList;

import org.mule.api.MuleMessage;
import org.mule.api.transformer.TransformerException;
import org.mule.transformer.AbstractMessageTransformer;

public class EmptyPayload extends AbstractMessageTransformer{

	@Override
    public Object transformMessage(MuleMessage message, String outputEncoding) throws TransformerException {

		Object payload = message.getPayload();
		
		ArrayList<Object> list = new ArrayList<Object>(); 
		payload = list;
		
		return payload;
    }
	
}
