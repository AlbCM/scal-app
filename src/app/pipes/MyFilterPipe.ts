import { Pipe, PipeTransform } from '@angular/core';  
import { Employee } from '../models/Employee';
  
@Pipe({  
    name: 'filterByName',  
    pure: false  
})  
  
export class MyFilterPipe implements PipeTransform {  
    transform(items: any[], filter: Employee): any {  
        if (!items || !filter) {  
            return items;  
        }  
        return items.filter(item => 
            item.name.toLowerCase().indexOf(filter.name) !== -1);  
    }  
}  