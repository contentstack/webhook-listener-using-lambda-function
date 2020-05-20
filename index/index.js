const request = require("request-promise");

const { managementToken, apiKey, baseUrlRegion} = process.env;

const getEntry = async (contentTypeUid,uid) => {
  var options = {
    method: "GET",
    url: `${baseUrlRegion}v3/content_types/${contentTypeUid}/entries/${uid}`,
    json: true,
    headers: {
      "content-Type": "application/json",
      Authorization: managementToken,
      api_key: apiKey,
    },
  };
  let response = await request(options);
  let { date, priority } = response.entry;
  let sortOrderField = date + "-" + priority;
  if (sortOrderField !== response.entry.sort_order) {
    return Promise.resolve(sortOrderField);
  } else {
    return null;
  }
};

const updateEntry = async (sortOrderField, contentTypeUid, uid) => {
  var options = {
    method: "PUT",
    url: `${baseUrlRegion}v3/content_types/${contentTypeUid}/entries/${uid}`,
    body: {
      entry: {
        sort_order: sortOrderField,
      },
    },
    json: true,
    headers: {
      "content-Type": "application/json",
      Authorization: managementToken,
      api_key: apiKey,
    },
  };
  return request(options);
};

const sortUpdateHandler = async (contentTypeUid, entryUid) => {
  
  let entryInfo = await getEntry(contentTypeUid, entryUid);
  if (entryInfo !== null) {
    await updateEntry(entryInfo, contentTypeUid, entryUid);
  }
};

exports.handler = async (event, context, callback) => {
  let body = JSON.parse(event.body);
  try {
    await sortUpdateHandler(body.data.content_type.uid, body.data.entry.uid);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Field Updated" }),
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};

