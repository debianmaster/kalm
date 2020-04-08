import { Map, List } from "immutable";

export const extractSummaryInfoFromMap = (values: Map<string, any>, name: string): string => {
  return values.get(name).map((value: any, key: string) => {
    if (typeof value === "string") {
      return value;
    } else if (Map.isMap(value)) {
      return value.map((v: any, key: string) => {
        if (Map.isMap(v)) {
          const subKeys = v.keySeq().toArray();
          return v
            .toList()
            .map((subV: string, index: number) => {
              return subKeys[index] + ": value :" + subV;
            })
            .join(",");
        } else if (List.isList(v)) {
          return v.join && v.join(",");
        } else {
          return v;
        }
      });
    } else {
      console.log("other type value", value.toJS());
    }
    return value;
  });
};

export const extractSummaryInfoFromList = (values: Map<string, any>, name: string): string => {
  return JSON.stringify(values.get(name).toJS());
  // return values.get(name).map((item: any) => {
  //   return item.join(",");
  // });
};
