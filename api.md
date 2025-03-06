# yupi API Documentation

This document provides detailed information about all available endpoints in the Yupi API.

## Table of Contents

- [Authentication](#authentication)
  - [Login](#login)
  - [Refresh Token](#refresh-token)
  - [Logout](#logout)
- [Bill Splitting](#bill-splitting)

## Authentication

All authenticated endpoints require a valid JWT token to be included in the request header. 

**Authorization Header Format**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Login

Log in to obtain an access token.

**URL**: `/auth/login`  
**Method**: `POST`  
**Auth required**: No  

**Request Body** (form data):
```
username=string&password=string
```

**Success Response**: `200 OK`
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

**Notes**:
- Access token is returned in the response
- Refresh token is set as an HTTP-only cookie

**Error Responses**:
- `401 Unauthorized` - Incorrect username or password
- `422 Unprocessable Entity` - Validation error

### Refresh Token

Get a new access token using the refresh token stored in cookies.

**URL**: `/auth/refresh`  
**Method**: `POST`  
**Auth required**: No (but requires refresh token cookie)  

**Success Response**: `200 OK`
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

**Error Responses**:
- `401 Unauthorized` - Invalid refresh token
- `422 Unprocessable Entity` - Validation error

### Logout

Log out by clearing the refresh token cookie.

**URL**: `/auth/logout`  
**Method**: `POST`  
**Auth required**: No  

**Success Response**: `200 OK`
```json
{
  "message": "Successfully logged out"
}
```

## Bill Splitting

### Analyze Bill Image

Analyze a bill image to extract items and suggest how to split the costs.

**URL**: `/splitbill/analyze`  
**Method**: `POST`  
**Auth required**: Yes  
**Content-Type**: `multipart/form-data`  

**Request Parameters**:
- `image`: Image file (JPEG, PNG, WEBP)
- `description`: String describing how to split the bill
- `image_description`: Optional pre-analyzed image text (if already processed)

**Notes**:
- Maximum file size: 5MB
- Supported image formats: JPEG, PNG, WEBP
- The API uses OpenAI's vision model to extract items from the bill image
- If image_description is provided, the image processing step is skipped

**Success Response**: `200 OK`
```json
{
  "split_details": {
    "person_name": {
      "items": [
        {
          "item": "string",
          "price": "string"
        }
      ],
      "individual_total": "string",
      "vat_share": "string",
      "other_share": "string",
      "discount_share": "string",
      "final_total": "string"
    }
  },
  "total_bill": "string",
  "subtotal": "string",
  "subtotal_vat": "string",
  "subtotal_other": "string",
  "subtotal_discount": "string",
  "currency": "string",
  "image_description": "string",
  "token_count": {
    "image": 0,
    "analysis": 0
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid bill image
- `401 Unauthorized` - Not authenticated
- `413 Request Entity Too Large` - File too large (>5MB)
- `415 Unsupported Media Type` - Unsupported file type
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Processing error