package digilib.util;

/*
 * #%L
 * ImageSize.java -- digilib image size class.
 *  
 * Digital Image Library servlet components
 * 
 * %%
 * Copyright (C) 2003 - 2013 MPIWG Berlin
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as 
 * published by the Free Software Foundation, either version 3 of the 
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Lesser Public License for more details.
 * 
 * You should have received a copy of the GNU General Lesser Public 
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/lgpl-3.0.html>.
 * #L%
 * Author: Robert Casties (robcast@berlios.de)
 * Created on 26.08.2003
 */

/** Class for image size (width, height).
 * 
 * A width or height of 0 is treated as a 'wildcard' that matches any size.
 * 
 * @author casties
 *          
 */
public class ImageSize {
	public int width;
	public int height;

	public ImageSize() {
		super();
	}

	public ImageSize(int width, int height) {
		this.width = width;
		this.height = height;
	}

	public ImageSize(ImageSize i) {
		this.width = i.width;
		this.height = i.height;
	}

	public void setSize(int width, int height) {
		this.width = width;
		this.height = height;
	}

	/**
	 * Returns if the size of this image is smaller in every dimension than the
	 * other image.
	 * 
	 * 
	 * 
	 * @param is
	 * @return
	 */
	public boolean isTotallySmallerThan(ImageSize is) {
		if ((this.width == 0)||(is.width == 0)) {
			// width wildcard
			return (this.height <= is.height);
		}
		if ((this.height == 0)||(is.height == 0)) {
			// height wildcard
			return (this.width <= is.width);
		}
		return ((this.width <= is.width)&&(this.height <= is.height));
	}

	/**
	 * Returns if the size of this image is smaller in at least one dimension
	 * than the other image.
	 * 
	 * @param is
	 * @return
	 */
	public boolean isSmallerThan(ImageSize is) {
		if ((this.width == 0)||(is.width == 0)) {
			// width wildcard
			return (this.height <= is.height);
		}
		if ((this.height == 0)||(is.height == 0)) {
			// height wildcard
			return (this.width <= is.width);
		}
		return ((this.width <= is.width) || (this.height <= is.height));
	}

	/**
	 * Returns if the size of this image is bigger in every dimension than the
	 * other image.
	 * 
	 * 
	 * 
	 * @param is
	 * @return
	 */
	public boolean isTotallyBiggerThan(ImageSize is) {
		if ((this.width == 0)||(is.width == 0)) {
			// width wildcard
			return (this.height >= is.height);
		}
		if ((this.height == 0)||(is.height == 0)) {
			// height wildcard
			return (this.width >= is.width);
		}
		return ((this.width >= is.width) && (this.height >= is.height));
	}

	/**
	 * Returns if the size of this image is bigger in at least one dimension
	 * than the other image.
	 * 
	 * 
	 * 
	 * @param is
	 * @return
	 */
	public boolean isBiggerThan(ImageSize is) {
		if ((this.width == 0)||(is.width == 0)) {
			// width wildcard
			return (this.height >= is.height);
		}
		if ((this.height == 0)||(is.height == 0)) {
			// height wildcard
			return (this.width >= is.width);
		}
		return ((this.width >= is.width) || (this.height >= is.height));
	}

	/**
	 * Returns if this image has the same size or height as the other image.
	 * 
	 * 
	 * 
	 * @param is
	 * @return
	 */
	public boolean fitsIn(ImageSize is) {
		if ((this.width == 0)||(is.width == 0)) {
			// width wildcard
			return (this.height == is.height);
		}
		if ((this.height == 0)||(is.height == 0)) {
			// height wildcard
			return (this.width == is.width);
		}
		return (
			(this.width == is.width)
				&& (this.height <= is.height)
				|| (this.width <= is.width)
				&& (this.height == is.height));
	}

	/**
	 * Returns if the size of this image is the same as the other image.
	 * 
	 * 
	 * 
	 * @param is
	 * @return
	 */
	public boolean equals(ImageSize is) {
		if ((this.width == 0)||(is.width == 0)) {
			// width wildcard
			return (this.height == is.height);
		}
		if ((this.height == 0)||(is.height == 0)) {
			// height wildcard
			return (this.width == is.width);
		}
		return ((this.width == is.width) && (this.height == is.height));
	}

	/**
	 * @return
	 */
	public int getHeight() {
		return height;
	}

	/**
	 * @param height
	 */
	public void setHeight(int height) {
		this.height = height;
	}

	/**
	 * @return
	 */
	public int getWidth() {
		return width;
	}

	/**
	 * @param width
	 */
	public void setWidth(int width) {
		this.width = width;
	}

	/**
	 * Returns the aspect ratio.
	 * 
	 * Aspect ratio is (width/height). So it's <1 for portrait and  >1 for
	 * landscape.
	 * 
	 * @return
	 */
	public float getAspect() {
		return (height > 0) ? ((float) width / (float) height) : 0;
	}
	
	/**
	 * Returns a scaled copy of this image size. 
	 * 
	 * @param scale
	 * @return
	 */
	public ImageSize getScaled(float scale) {
		return new ImageSize((int) (width * scale), (int) (height * scale));
	}
	
	/* (non-Javadoc)
	 * @see java.lang.Object#toString()
	 */
	public String toString() {
		String s = "[" + width + "x" + height + "]";
		return s;
	}
}
