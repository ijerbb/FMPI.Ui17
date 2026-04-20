import { Product } from "../product";
import { ResponseDto } from "./responseDto";

export class ResponseListDto<T> {
    pageStart = 1;
    pageEnd = 5;
    pageNum = 1;
    pageSize = 20;
    totalRecords = 0;
    lists:T[] = [];
    pageNoList: number[] = [];
}