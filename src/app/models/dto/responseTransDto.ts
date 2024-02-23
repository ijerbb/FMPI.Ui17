import { Product } from "../product";
import { ResponseDto } from "./responseDto";

export class ResponseTransDto<T, U> {
    pageStart = 1;
    pageEnd = 5;
    pageNum = 1;
    totalRecords = 0;
    header: T = {} as T;
    details:U[] = [];
}