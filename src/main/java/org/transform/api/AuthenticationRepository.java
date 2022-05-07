package org.transform.api;

import java.util.Map;

import org.mule.api.MuleMessage;
import org.mule.api.transformer.TransformerException;
import org.mule.transformer.AbstractMessageTransformer;

public class AuthenticationRepository extends AbstractMessageTransformer{
	
	@Override
    public Object transformMessage(MuleMessage message, String outputEncoding) throws TransformerException {

		Object payload = message.getPayload();
		return payload;
    }
	
	public static Object findValueMap(Object in, String key) {
	
		if(in instanceof Map) {
			
			Map<?, ?> map = (Map<?, ?>)in;
			return map.get(key);
	
		}
		return null;
		
	}
}
